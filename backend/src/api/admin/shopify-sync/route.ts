import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { runShopifyCatalogSync } from "../../../workflows/sync-shopify-products"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productModuleService = req.scope.resolve(Modules.PRODUCT)
  const products = await productModuleService.listProducts(
    {},
    {
      select: ["id", "handle", "title", "metadata"],
      take: 5000,
    }
  )

  const syncedProducts = products.filter(
    (p) =>
      p.metadata &&
      typeof p.metadata === "object" &&
      (p.metadata as Record<string, unknown>).source === "shopify_sync"
  )

  res.status(200).json({
    totalMedusaProducts: products.length,
    syncedFromShopifyCount: syncedProducts.length,
    sourceDomain: process.env.SHOPIFY_DOMAIN || "illusionline.com",
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as { limit?: number; domain?: string }
  const queryLimit = req.query?.limit ? Number(req.query.limit) : undefined
  const limit = body.limit ?? queryLimit ?? 10

  try {
    const result = await runShopifyCatalogSync(req.scope, {
      limit,
      domain: body.domain,
    })

    res.status(200).json({
      success: true,
      ...result,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    res.status(500).json({
      success: false,
      message,
    })
  }
}
