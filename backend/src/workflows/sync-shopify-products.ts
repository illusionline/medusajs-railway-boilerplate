import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createProductsWorkflow,
  createSalesChannelsWorkflow,
  createShippingProfilesWorkflow,
  uploadFilesWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  cleanShopifyBodyHtml,
  downloadProductImages,
  fetchShopifyProductsPage,
  normalizeShopifyOptionsAndVariants,
} from "../lib/shopify-import"

export type SyncedProductSummary = {
  id: string
  title: string
  handle: string
  shopifyId: string | number
  aedPrice: number
  imageCount: number
  variantCount: number
  thumbnail?: string | null
}

export type SkippedProductSummary = {
  title: string
  handle: string
  reason: "already_exists" | "missing_handle"
}

export type FailedProductSummary = {
  title: string
  handle: string
  error: string
}

export type ShopifyCatalogSyncResult = {
  limit: number
  importedCount: number
  skippedCount: number
  errorCount: number
  salesChannelId: string
  shippingProfileId: string
  imported: SyncedProductSummary[]
  skipped: SkippedProductSummary[]
  errors: FailedProductSummary[]
}

async function resolveDefaultSalesChannelId(
  container: MedusaContainer
): Promise<string> {
  const storeModuleService = container.resolve(Modules.STORE)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)

  const stores = await storeModuleService.listStores()
  if (stores[0]?.default_sales_channel_id) {
    return stores[0].default_sales_channel_id
  }

  const namedDefault = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  })
  if (namedDefault.length > 0) {
    return namedDefault[0].id
  }

  const anyChannels = await salesChannelModuleService.listSalesChannels()
  if (anyChannels.length > 0) {
    return anyChannels[0].id
  }

  const { result } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [{ name: "Default Sales Channel" }],
    },
  })
  return result[0].id
}

async function resolveDefaultShippingProfileId(
  container: MedusaContainer
): Promise<string> {
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

  const defaultProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  })
  if (defaultProfiles.length > 0) {
    return defaultProfiles[0].id
  }

  const allProfiles = await fulfillmentModuleService.listShippingProfiles()
  if (allProfiles.length > 0) {
    return allProfiles[0].id
  }

  const { result } = await createShippingProfilesWorkflow(container).run({
    input: {
      data: [
        {
          name: "Default Shipping Profile",
          type: "default",
        },
      ],
    },
  })
  return result[0].id
}

/**
 * Safe, idempotent Shopify -> Medusa v2 + Railway S3 Catalog Sync runner.
 * - Skips any handle already present in Medusa (e.g. `noir-sculpt-corset-gown`)
 * - Uploads all downloaded Shopify images into Medusa's File Module (Railway S3 Bucket) via `uploadFilesWorkflow`
 * - Injects a `"Custom"` variant for Made-to-Measure tailoring on every imported gown
 * - Stops cleanly once `limit` new dresses (default 10) have been created
 */
export async function runShopifyCatalogSync(
  container: MedusaContainer,
  options?: {
    limit?: number
    domain?: string
  }
): Promise<ShopifyCatalogSyncResult> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModuleService = container.resolve(Modules.PRODUCT)

  const requestedLimit = Number(options?.limit ?? 10)
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(Math.round(requestedLimit), 50))
    : 10

  const [salesChannelId, shippingProfileId, existingProducts] =
    await Promise.all([
      resolveDefaultSalesChannelId(container),
      resolveDefaultShippingProfileId(container),
      productModuleService.listProducts(
        {},
        {
          select: ["id", "handle"],
          relations: ["variants"],
          take: 5000,
        }
      ),
    ])

  const existingHandles = new Set<string>()
  const usedSkus = new Set<string>()

  for (const existing of existingProducts) {
    if (existing.handle) {
      existingHandles.add(existing.handle.trim().toLowerCase())
    }
    for (const v of existing.variants || []) {
      if (v.sku) {
        usedSkus.add(v.sku.trim().toUpperCase())
      }
    }
  }

  const imported: SyncedProductSummary[] = []
  const skipped: SkippedProductSummary[] = []
  const errors: FailedProductSummary[] = []

  let page = 1
  let nextPageInfo: string | undefined = undefined
  const maxPages = 20
  const usingAdminApi = Boolean((process.env.SHOPIFY_ADMIN_TOKEN || "").trim())

  logger.info(
    `[Shopify Sync] Starting catalog sync (target limit: ${limit} new dresses, existing Medusa products: ${existingHandles.size})...`
  )

  while (imported.length < limit && page <= maxPages) {
    const feedPage = await fetchShopifyProductsPage({
      page,
      pageLimit: 25,
      pageInfo: nextPageInfo,
      domain: options?.domain,
    })

    if (!feedPage.products.length) {
      break
    }

    for (const shopifyProduct of feedPage.products) {
      if (imported.length >= limit) {
        break
      }

      const handle = (shopifyProduct.handle || "").trim()
      if (!handle) {
        skipped.push({
          title: shopifyProduct.title || "Untitled",
          handle: "",
          reason: "missing_handle",
        })
        continue
      }

      const lowerHandle = handle.toLowerCase()
      if (existingHandles.has(lowerHandle)) {
        skipped.push({
          title: shopifyProduct.title,
          handle,
          reason: "already_exists",
        })
        continue
      }

      try {
        // 1. Download all source images & upload into Medusa's File Module (Railway S3 Bucket)
        const downloadedBuffers = await downloadProductImages(
          shopifyProduct.images || [],
          handle,
          4
        )

        let hostedImageUrls: string[] = []
        if (downloadedBuffers.length > 0) {
          const { result: uploadedFiles } = await uploadFilesWorkflow(
            container
          ).run({
            input: {
              files: downloadedBuffers.map((img) => ({
                filename: img.filename,
                mimeType: img.mimeType,
                content: img.buffer.toString("base64"),
                access: "public" as const,
              })),
            },
          })

          hostedImageUrls = (uploadedFiles || [])
            .map((f) => f.url)
            .filter(
              (url): url is string =>
                Boolean(url) && !url.includes("cdn.shopify.com")
            )
        }

        // 2. Clean HTML description & normalize options/variants (including Custom Made-to-Measure variant)
        const description = cleanShopifyBodyHtml(
          shopifyProduct.body_html,
          shopifyProduct.title
        )
        const normalized = normalizeShopifyOptionsAndVariants(
          shopifyProduct,
          usedSkus
        )

        // 3. Create published Medusa v2 product linked to Default Sales Channel & Shipping Profile
        const { result: createdProducts } = await createProductsWorkflow(
          container
        ).run({
          input: {
            products: [
              {
                title: shopifyProduct.title.trim(),
                handle,
                external_id: String(shopifyProduct.id),
                description,
                status: ProductStatus.PUBLISHED,
                thumbnail: hostedImageUrls[0] || undefined,
                images: hostedImageUrls.map((url) => ({ url })),
                options: normalized.options,
                variants: normalized.variants,
                sales_channels: [{ id: salesChannelId }],
                shipping_profile_id: shippingProfileId,
                metadata: {
                  shopify_id: shopifyProduct.id,
                  source: "shopify_sync",
                  synced_at: new Date().toISOString(),
                },
              },
            ],
          },
        })

        const created = createdProducts[0]
        existingHandles.add(lowerHandle)

        imported.push({
          id: created.id,
          title: created.title,
          handle: created.handle,
          shopifyId: shopifyProduct.id,
          aedPrice: normalized.baseAedPrice,
          imageCount: hostedImageUrls.length,
          variantCount: normalized.variants.length,
          thumbnail: created.thumbnail,
        })

        logger.info(
          `[Shopify Sync] Imported "${created.title}" (${created.handle}) — AED ${normalized.baseAedPrice}, ${hostedImageUrls.length} S3 images, ${normalized.variants.length} variants.`
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        logger.error(
          `[Shopify Sync] Failed importing "${shopifyProduct.title}" (${handle}): ${message}`
        )
        errors.push({
          title: shopifyProduct.title,
          handle,
          error: message,
        })
      }
    }

    if (usingAdminApi) {
      if (!feedPage.nextPageInfo) {
        break
      }
      nextPageInfo = feedPage.nextPageInfo
    }

    page += 1
  }

  logger.info(
    `[Shopify Sync] Completed: ${imported.length} imported, ${skipped.length} skipped, ${errors.length} errors.`
  )

  return {
    limit,
    importedCount: imported.length,
    skippedCount: skipped.length,
    errorCount: errors.length,
    salesChannelId,
    shippingProfileId,
    imported,
    skipped,
    errors,
  }
}
