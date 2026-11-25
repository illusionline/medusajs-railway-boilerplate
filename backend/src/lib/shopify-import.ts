export type ShopifyVariant = {
  id: number | string
  product_id?: number | string
  title: string
  option1?: string | null
  option2?: string | null
  option3?: string | null
  sku?: string | null
  price: string
  compare_at_price?: string | null
  position?: number
}

export type ShopifyOption = {
  id?: number | string
  product_id?: number | string
  name: string
  position: number
  values: string[]
}

export type ShopifyImage = {
  id?: number | string
  position?: number
  src: string
  width?: number
  height?: number
  variant_ids?: Array<number | string>
}

export type ShopifyProduct = {
  id: number | string
  title: string
  handle: string
  body_html?: string | null
  vendor?: string | null
  product_type?: string | null
  tags?: string[] | string
  options: ShopifyOption[]
  variants: ShopifyVariant[]
  images: ShopifyImage[]
}

export type NormalizedMedusaOption = {
  title: string
  values: string[]
}

export type NormalizedMedusaVariant = {
  title: string
  sku: string
  manage_inventory: boolean
  allow_backorder: boolean
  options: Record<string, string>
  prices: Array<{
    currency_code: string
    amount: number
  }>
}

const NAMED_HTML_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  "#39": "'",
  "#039": "'",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  hellip: "…",
  bull: "•",
  deg: "°",
  copy: "©",
  reg: "®",
  trade: "™",
  eacute: "é",
  egrave: "è",
  ecirc: "ê",
  agrave: "à",
  ccedil: "ç",
}

const CUSTOM_KEYWORDS = [
  "custom",
  "made-to-measure",
  "made to measure",
  "bespoke",
  "mtm",
]

function isCustomValue(val?: string | null): boolean {
  if (!val) return false
  const lower = val.trim().toLowerCase()
  return CUSTOM_KEYWORDS.some((kw) => lower === kw || lower.includes(kw))
}

/**
 * Decodes named, decimal (&#123;), and hex (&#x1F;) HTML entities cleanly.
 */
export function decodeHtmlEntities(input: string): string {
  if (!input) return ""

  return input
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, hex) => {
      const code = parseInt(hex, 16)
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : ""
    })
    .replace(/&#(\d+);/g, (_match, dec) => {
      const code = parseInt(dec, 10)
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : ""
    })
    .replace(/&([a-zA-Z0-9#]+);/g, (full, name) => {
      const lower = name.toLowerCase()
      return Object.prototype.hasOwnProperty.call(NAMED_HTML_ENTITIES, lower)
        ? NAMED_HTML_ENTITIES[lower]
        : full
    })
}

/**
 * Converts Shopify `body_html` into clean luxury plain text:
 * - Turns `<li>` into `• ` bullets
 * - Converts `<p>` / `<br>` / block closures into clean line breaks
 * - Strips all raw HTML tags and decodes HTML entities
 * - Removes internal legacy Toman scratch notes (e.g. `79900 T`) and duplicate title headers
 */
export function cleanShopifyBodyHtml(
  bodyHtml?: string | null,
  productTitle?: string
): string {
  if (!bodyHtml || typeof bodyHtml !== "string") {
    return ""
  }

  let text = bodyHtml
    // Strip non-visible blocks
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|head|noscript)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<meta[^>]*>/gi, "")
    // Convert list items into clean bullets
    .replace(/<li[^>]*>\s*/gi, "\n• ")
    .replace(/<\/li>/gi, "\n")
    // Line and paragraph breaks
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|ul|ol|h[1-6]|blockquote|tr)>/gi, "\n\n")
    // Strip all remaining HTML tags
    .replace(/<[^>]+>/g, "")

  text = decodeHtmlEntities(text)

  const normalizedTitle = (productTitle || "").trim().toLowerCase()

  const rawLines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t\u00A0]+/g, " ").trim())

  const outputLines: string[] = []
  let previousWasBlank = true
  let previousWasBullet = false

  for (const line of rawLines) {
    if (!line) {
      if (!previousWasBlank) {
        outputLines.push("")
        previousWasBlank = true
        previousWasBullet = false
      }
      continue
    }

    // Omit internal legacy Toman price scratch lines (e.g. "79900 T", "69,900 T")
    if (/^\d[\d,.\s]*t$/i.test(line)) {
      continue
    }

    // Omit redundant standalone product title header inside body copy
    const cleanForCompare = line.replace(/^•\s*/, "").trim().toLowerCase()
    if (normalizedTitle && cleanForCompare === normalizedTitle) {
      continue
    }

    const isBullet = line.startsWith("• ")
    // Keep consecutive bullets tight without blank lines between them
    if (
      isBullet &&
      previousWasBlank &&
      outputLines.length > 0 &&
      outputLines[outputLines.length - 1] === "" &&
      outputLines.length >= 2 &&
      outputLines[outputLines.length - 2].startsWith("• ")
    ) {
      outputLines.pop()
    }

    // Normalize stray "• • " if nested tags existed
    const normalizedLine = isBullet
      ? `• ${line.replace(/^(?:•\s*)+/, "")}`
      : line

    outputLines.push(normalizedLine)
    previousWasBlank = false
    previousWasBullet = isBullet
    void previousWasBullet
  }

  while (outputLines.length > 0 && outputLines[0] === "") {
    outputLines.shift()
  }
  while (
    outputLines.length > 0 &&
    outputLines[outputLines.length - 1] === ""
  ) {
    outputLines.pop()
  }

  return outputLines.join("\n").replace(/\n{3,}/g, "\n\n")
}

/**
 * Strips Shopify CDN resize suffixes (e.g., `_800x`, `_1024x1024`, `_grande`, `_crop_center`)
 * and width/height resize query params so we always download full-resolution source images.
 */
export function normalizeShopifyImageUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== "string") return ""

  let trimmed = rawUrl.trim()
  if (trimmed.startsWith("//")) {
    trimmed = `https:${trimmed}`
  }

  try {
    const parsed = new URL(trimmed)
    // Remove Shopify CDN resize query parameters while preserving cache version `v`
    parsed.searchParams.delete("width")
    parsed.searchParams.delete("height")
    parsed.searchParams.delete("crop")

    // Strip size tokens like `_1024x1024`, `_800x`, `_x1200`, `_small`, `_grande`, `_crop_center` before extension
    parsed.pathname = parsed.pathname.replace(
      /_(?:(?:\d+x\d*)|(?:x\d+)|pico|icon|thumb|small|compact|medium|large|grande|master)(?:_crop_(?:center|top|bottom|left|right))?(?=\.(?:jpe?g|png|webp|avif|gif)$)/i,
      ""
    )

    return parsed.toString()
  } catch {
    return trimmed
  }
}

function sanitizeSkuSegment(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function allocateUniqueSku(
  baseSku: string,
  suffix: string,
  fallbackId: string | number,
  usedSkus: Set<string>
): string {
  const cleanBase =
    sanitizeSkuSegment(baseSku) || `ILS-${sanitizeSkuSegment(String(fallbackId))}`
  const cleanSuffix = sanitizeSkuSegment(suffix)

  let candidate = cleanSuffix ? `${cleanBase}-${cleanSuffix}` : cleanBase
  if (!usedSkus.has(candidate)) {
    usedSkus.add(candidate)
    return candidate
  }

  let fallbackCandidate = `${candidate}-${sanitizeSkuSegment(
    String(fallbackId).slice(-6)
  )}`
  let counter = 2
  while (usedSkus.has(fallbackCandidate)) {
    fallbackCandidate = `${candidate}-${counter}`
    counter += 1
  }

  usedSkus.add(fallbackCandidate)
  return fallbackCandidate
}

/**
 * Normalizes Shopify product options & variants for Medusa v2:
 * - Ensures a `Size` option exists and always includes `"Custom"` for Made-to-Measure
 * - Generates a `"Custom"` variant (one per color if multi-color) priced at base AED price
 * - Converts variant prices to integer major AED units with `manage_inventory: false` and `allow_backorder: true`
 * - Guarantees globally unique SKUs across variants
 */
export function normalizeShopifyOptionsAndVariants(
  product: ShopifyProduct,
  usedSkus: Set<string> = new Set()
): {
  options: NormalizedMedusaOption[]
  variants: NormalizedMedusaVariant[]
  baseAedPrice: number
} {
  const rawOptions = Array.isArray(product.options) ? product.options : []
  const rawVariants = Array.isArray(product.variants) ? product.variants : []

  const firstPositivePrice = rawVariants
    .map((v) => Math.round(Number(v.price) || 0))
    .find((p) => p > 0)
  const baseAedPrice = firstPositivePrice ?? 0

  const primaryBaseSku =
    rawVariants.map((v) => (v.sku || "").trim()).find(Boolean) ||
    `ILS-${product.id}`

  // Handle single default-title products cleanly by exposing Size: Standard + Custom
  const isSingleDefaultProduct =
    rawOptions.length === 0 ||
    (rawOptions.length === 1 &&
      rawOptions[0].name.toLowerCase() === "title" &&
      rawOptions[0].values.length === 1 &&
      rawOptions[0].values[0].toLowerCase() === "default title")

  if (isSingleDefaultProduct) {
    const standardSku = allocateUniqueSku(
      primaryBaseSku,
      "STANDARD",
      rawVariants[0]?.id || product.id,
      usedSkus
    )
    const customSku = allocateUniqueSku(
      primaryBaseSku,
      "CUSTOM",
      product.id,
      usedSkus
    )

    return {
      baseAedPrice,
      options: [
        {
          title: "Size",
          values: ["XS", "S", "M", "L", "XL", "Custom"],
        },
      ],
      variants: [
        ...["XS", "S", "M", "L", "XL"].map((sz, idx) => ({
          title: sz,
          sku:
            idx === 0
              ? standardSku
              : allocateUniqueSku(primaryBaseSku, sz, product.id, usedSkus),
          manage_inventory: false,
          allow_backorder: true,
          options: { Size: sz },
          prices: [{ currency_code: "aed", amount: baseAedPrice }],
        })),
        {
          title: "Custom",
          sku: customSku,
          manage_inventory: false,
          allow_backorder: true,
          options: { Size: "Custom" },
          prices: [{ currency_code: "aed", amount: baseAedPrice }],
        },
      ],
    }
  }

  // Normalize option titles & locate Size option index
  const optionDefs = rawOptions.slice(0, 3).map((opt, idx) => {
    const cleanTitle =
      opt.name && opt.name.trim().toLowerCase() !== "title"
        ? opt.name.trim()
        : idx === 0
        ? "Size"
        : `Option ${idx + 1}`

    return {
      index: idx, // 0 -> option1, 1 -> option2, 2 -> option3
      title: cleanTitle,
      values: Array.from(
        new Set((opt.values || []).map((v) => String(v).trim()).filter(Boolean))
      ),
    }
  })

  // Ensure unique option titles
  const seenTitles = new Set<string>()
  for (const def of optionDefs) {
    if (seenTitles.has(def.title.toLowerCase())) {
      def.title = `${def.title} ${def.index + 1}`
    }
    seenTitles.add(def.title.toLowerCase())
  }

  let sizeOptDef = optionDefs.find((o) =>
    /size|fit|taille/i.test(o.title)
  )
  if (!sizeOptDef) {
    // If only 1 option exists, treat it as the Size/Fit option; otherwise use the last option if size-like or add Custom
    sizeOptDef = optionDefs[0]
  }

  const existingCustomLabel = sizeOptDef.values.find((v) => isCustomValue(v))
  const customOptionValue = existingCustomLabel || "Custom"
  if (!existingCustomLabel) {
    sizeOptDef.values.push("Custom")
  }

  const variants: NormalizedMedusaVariant[] = []
  const seenOptionCombos = new Set<string>()

  const getVariantOptionValue = (
    v: ShopifyVariant,
    idx: number,
    fallback: string
  ): string => {
    const raw =
      idx === 0 ? v.option1 : idx === 1 ? v.option2 : idx === 2 ? v.option3 : null
    const trimmed = raw ? String(raw).trim() : ""
    return trimmed || fallback
  }

  // Track non-size option combinations so we can generate 1 Custom variant per Color (or 1 overall)
  const nonSizeGroups = new Map<
    string,
    { nonSizeOptions: Record<string, string>; basePrice: number; baseSku: string }
  >()

  for (const sv of rawVariants) {
    const optMap: Record<string, string> = {}
    const titleParts: string[] = []

    for (const def of optionDefs) {
      const val = getVariantOptionValue(
        sv,
        def.index,
        def.values[0] || "Standard"
      )
      if (!def.values.includes(val)) {
        def.values.push(val)
      }
      optMap[def.title] = val
      titleParts.push(val)
    }

    const comboKey = optionDefs.map((d) => `${d.title}=${optMap[d.title]}`).join("|")
    if (seenOptionCombos.has(comboKey)) {
      continue
    }
    seenOptionCombos.add(comboKey)

    const aedPrice = Math.round(Number(sv.price) || baseAedPrice)
    const variantBaseSku = (sv.sku || "").trim() || primaryBaseSku
    const variantTitle = titleParts.join(" / ")

    const sku = allocateUniqueSku(
      variantBaseSku,
      titleParts.join("-"),
      sv.id || product.id,
      usedSkus
    )

    variants.push({
      title: variantTitle,
      sku,
      manage_inventory: false,
      allow_backorder: true,
      options: optMap,
      prices: [{ currency_code: "aed", amount: aedPrice }],
    })

    const nonSizeOptions: Record<string, string> = {}
    const nonSizeKeyParts: string[] = []
    for (const def of optionDefs) {
      if (def.title !== sizeOptDef.title) {
        nonSizeOptions[def.title] = optMap[def.title]
        nonSizeKeyParts.push(`${def.title}=${optMap[def.title]}`)
      }
    }
    const groupKey = nonSizeKeyParts.join("|") || "__default__"
    if (!nonSizeGroups.has(groupKey)) {
      nonSizeGroups.set(groupKey, {
        nonSizeOptions,
        basePrice: aedPrice > 0 ? aedPrice : baseAedPrice,
        baseSku: variantBaseSku,
      })
    }
  }

  // Ensure at least one group exists even if Shopify returned 0 variants
  if (nonSizeGroups.size === 0) {
    nonSizeGroups.set("__default__", {
      nonSizeOptions: {},
      basePrice: baseAedPrice,
      baseSku: primaryBaseSku,
    })
  }

  // Generate a "Custom" Made-to-Measure variant for each non-size group (e.g. per Color) if missing
  for (const [, group] of nonSizeGroups.entries()) {
    const customOptMap: Record<string, string> = {
      ...group.nonSizeOptions,
      [sizeOptDef.title]: customOptionValue,
    }
    const comboKey = optionDefs
      .map((d) => `${d.title}=${customOptMap[d.title]}`)
      .join("|")

    if (seenOptionCombos.has(comboKey)) {
      continue
    }
    seenOptionCombos.add(comboKey)

    const titleParts = optionDefs.map((d) => customOptMap[d.title])
    const customSku = allocateUniqueSku(
      group.baseSku,
      titleParts.join("-"),
      product.id,
      usedSkus
    )

    variants.push({
      title: titleParts.join(" / "),
      sku: customSku,
      manage_inventory: false,
      allow_backorder: true,
      options: customOptMap,
      prices: [{ currency_code: "aed", amount: group.basePrice }],
    })
  }

  const options: NormalizedMedusaOption[] = optionDefs.map((d) => ({
    title: d.title,
    values: d.values,
  }))

  return {
    options,
    variants,
    baseAedPrice,
  }
}

/**
 * Fetches a page of Shopify products.
 * - Uses Shopify Admin REST API if `SHOPIFY_ADMIN_TOKEN` is set (supports draft/1000+ SKU cursor pagination)
 * - Otherwise uses the public read-only `https://<domain>/products.json?limit=25&page=<page>` JSON feed
 */
export async function fetchShopifyProductsPage({
  page = 1,
  pageLimit = 25,
  pageInfo,
  domain,
  adminToken,
}: {
  page?: number
  pageLimit?: number
  pageInfo?: string
  domain?: string
  adminToken?: string
}): Promise<{ products: ShopifyProduct[]; nextPageInfo?: string }> {
  const cleanDomain = (
    domain ||
    process.env.SHOPIFY_DOMAIN ||
    "illusionline.com"
  )
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "")

  const token = (adminToken || process.env.SHOPIFY_ADMIN_TOKEN || "").trim()

  if (token) {
    const adminUrl = pageInfo
      ? `https://${cleanDomain}/admin/api/2024-10/products.json?limit=${pageLimit}&page_info=${encodeURIComponent(
          pageInfo
        )}`
      : `https://${cleanDomain}/admin/api/2024-10/products.json?limit=${pageLimit}&status=active`

    const res = await fetch(adminUrl, {
      headers: {
        "X-Shopify-Access-Token": token,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(20_000),
    })

    if (!res.ok) {
      const errBody = await res.text().catch(() => "")
      throw new Error(
        `Shopify Admin API error (${res.status}) from ${cleanDomain}: ${errBody.slice(
          0,
          300
        )}`
      )
    }

    const linkHeader = res.headers.get("link") || ""
    const nextMatch = linkHeader.match(
      /<[^>]*[?&]page_info=([^>&]+)[^>]*>;\s*rel="next"/i
    )
    const nextPageInfo = nextMatch ? decodeURIComponent(nextMatch[1]) : undefined
    const json = (await res.json()) as { products?: ShopifyProduct[] }

    return {
      products: Array.isArray(json.products) ? json.products : [],
      nextPageInfo,
    }
  }

  const publicUrl = `https://${cleanDomain}/products.json?limit=${pageLimit}&page=${page}`
  const res = await fetch(publicUrl, {
    headers: {
      Accept: "application/json",
      "User-Agent": "ILLUSIONLINE-Medusa-Catalog-Sync/1.0",
    },
    signal: AbortSignal.timeout(20_000),
  })

  if (!res.ok) {
    const errBody = await res.text().catch(() => "")
    throw new Error(
      `Shopify public feed error (${res.status}) from ${publicUrl}: ${errBody.slice(
        0,
        300
      )}`
    )
  }

  const json = (await res.json()) as { products?: ShopifyProduct[] }
  return {
    products: Array.isArray(json.products) ? json.products : [],
  }
}

export type DownloadedImageBuffer = {
  filename: string
  mimeType: string
  buffer: Buffer
}

function inferImageExtensionAndMime(
  url: string,
  contentTypeHeader?: string | null
): { ext: string; mimeType: string } {
  const ct = (contentTypeHeader || "").split(";")[0].trim().toLowerCase()
  if (ct === "image/png") return { ext: "png", mimeType: "image/png" }
  if (ct === "image/webp") return { ext: "webp", mimeType: "image/webp" }
  if (ct === "image/avif") return { ext: "avif", mimeType: "image/avif" }
  if (ct === "image/gif") return { ext: "gif", mimeType: "image/gif" }
  if (ct === "image/jpeg" || ct === "image/jpg") {
    return { ext: "jpg", mimeType: "image/jpeg" }
  }

  try {
    const pathname = new URL(url).pathname.toLowerCase()
    if (pathname.endsWith(".png")) return { ext: "png", mimeType: "image/png" }
    if (pathname.endsWith(".webp")) return { ext: "webp", mimeType: "image/webp" }
    if (pathname.endsWith(".avif")) return { ext: "avif", mimeType: "image/avif" }
    if (pathname.endsWith(".gif")) return { ext: "gif", mimeType: "image/gif" }
  } catch {
    // ignore URL parse error
  }

  return { ext: "jpg", mimeType: "image/jpeg" }
}

/**
 * Downloads a single source image into a Buffer (with 1 automatic retry on transient network failure).
 */
export async function downloadImageToBuffer(
  rawUrl: string,
  handle: string,
  index: number
): Promise<DownloadedImageBuffer> {
  const fullResUrl = normalizeShopifyImageUrl(rawUrl)
  let lastError: unknown

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(fullResUrl, {
        headers: {
          "User-Agent": "ILLUSIONLINE-Medusa-Catalog-Sync/1.0",
        },
        signal: AbortSignal.timeout(20_000),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} fetching image ${fullResUrl}`)
      }

      const arrayBuffer = await res.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      if (buffer.length === 0) {
        throw new Error(`Empty image buffer returned from ${fullResUrl}`)
      }

      const { ext, mimeType } = inferImageExtensionAndMime(
        fullResUrl,
        res.headers.get("content-type")
      )
      const safeHandle = handle
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "")
      const paddedIndex = String(index + 1).padStart(2, "0")

      return {
        filename: `${safeHandle || "gown"}-${paddedIndex}.${ext}`,
        mimeType,
        buffer,
      }
    } catch (err) {
      lastError = err
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Failed to download image: ${fullResUrl}`)
}

/**
 * Downloads all product images with bounded concurrency so 10–15 photos per gown fetch quickly without socket exhaustion.
 */
export async function downloadProductImages(
  images: ShopifyImage[],
  handle: string,
  concurrency = 4
): Promise<DownloadedImageBuffer[]> {
  const sorted = [...(images || [])]
    .filter((img) => Boolean(img?.src))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

  if (sorted.length === 0) {
    return []
  }

  const results: Array<DownloadedImageBuffer | null> = new Array(
    sorted.length
  ).fill(null)
  let cursor = 0

  const worker = async () => {
    while (cursor < sorted.length) {
      const idx = cursor
      cursor += 1
      results[idx] = await downloadImageToBuffer(sorted[idx].src, handle, idx)
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, sorted.length) },
    () => worker()
  )
  await Promise.all(workers)

  return results.filter((item): item is DownloadedImageBuffer => item !== null)
}
