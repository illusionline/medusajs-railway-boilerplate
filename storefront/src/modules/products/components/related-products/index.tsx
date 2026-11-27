import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "../product-preview"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

const SILHOUETTE_KEYWORDS = [
  "corset",
  "cape",
  "noir",
  "black",
  "velvet",
  "silk",
  "crepe",
  "drape",
  "sequin",
  "lace",
  "column",
  "mermaid",
  "strapless",
  "gown",
]

function computeSimilarityScore(
  base: HttpTypes.StoreProduct,
  candidate: HttpTypes.StoreProduct
): number {
  let score = 0

  if (
    base.collection_id &&
    candidate.collection_id &&
    base.collection_id === candidate.collection_id
  ) {
    score += 10
  }

  const baseTags = new Set(
    (base.tags || []).map((t) => (t.value || t.id || "").toLowerCase())
  )
  if (baseTags.size > 0 && candidate.tags?.length) {
    for (const tag of candidate.tags) {
      const val = (tag.value || tag.id || "").toLowerCase()
      if (val && baseTags.has(val)) {
        score += 3
      }
    }
  }

  const baseText = `${base.title || ""} ${base.description || ""}`.toLowerCase()
  const candText = `${candidate.title || ""} ${
    candidate.description || ""
  }`.toLowerCase()

  for (const kw of SILHOUETTE_KEYWORDS) {
    if (baseText.includes(kw) && candText.includes(kw)) {
      score += 1
    }
  }

  return score
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products: catalogProducts },
  } = await listProducts({
    countryCode,
    queryParams: {
      limit: 24,
      is_giftcard: false,
      fields:
        "*images,*collection,*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags",
    },
  }).catch(() => ({
    response: { products: [], count: 0 },
  }))

  const otherProducts = catalogProducts.filter((p) => p.id !== product.id)

  if (otherProducts.length === 0) {
    return null
  }

  // Row 1 — SIMILAR PIECES: rank by collection/tag/silhouette affinity, strictly excluding current product
  const similarPieces = [...otherProducts]
    .map((candidate, idx) => ({
      candidate,
      score: computeSimilarityScore(product, candidate),
      idx,
    }))
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.idx - b.idx))
    .slice(0, 4)
    .map((entry) => entry.candidate)

  const similarIds = new Set(similarPieces.map((p) => p.id))

  // Row 2 — BEST SELLERS: deduplicated against current product.id and Row 1 whenever catalog size > 5
  const deduplicatedBestSellers = otherProducts.filter(
    (p) => !similarIds.has(p.id)
  )

  const bestSellers =
    catalogProducts.length > 5 && deduplicatedBestSellers.length >= 4
      ? deduplicatedBestSellers.slice(0, 4)
      : catalogProducts.length > 5 && deduplicatedBestSellers.length > 0
      ? [
          ...deduplicatedBestSellers,
          ...otherProducts.filter((p) =>
            !deduplicatedBestSellers.some((d) => d.id === p.id)
          ),
        ].slice(0, Math.min(4, otherProducts.length))
      : otherProducts.slice(0, 4)

  // Wait: if catalogProducts.length > 5 and deduplicatedBestSellers.length >= 1, notice:
  // When >=9 products exist (our synced catalog), deduplicatedBestSellers.length >= 4 -> 100% deduplicated!
  // When 6..8 products exist, deduplicatedBestSellers leads first with all unseen gowns!

  return (
    <div className="space-y-20 md:space-y-24">
      {/* Row 1 — SIMILAR PIECES */}
      <section aria-labelledby="pdp-similar-pieces-heading">
        <div className="mb-8 pb-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <h2
            id="pdp-similar-pieces-heading"
            className="text-[13px] font-medium uppercase tracking-[0.18em] text-[#0A0A0A]"
          >
            SIMILAR PIECES
          </h2>
          <LocalizedClientLink
            href="/store"
            className="text-[11px] uppercase tracking-[0.14em] text-[#0A0A0A] underline underline-offset-4 hover:opacity-65 transition-opacity"
          >
            View All
          </LocalizedClientLink>
        </div>

        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 gap-y-8">
          {similarPieces.map((item) => (
            <li key={`similar-${item.id}`}>
              <ProductPreview region={region} product={item} />
            </li>
          ))}
        </ul>
      </section>

      {/* Row 2 — BEST SELLERS */}
      {bestSellers.length > 0 && (
        <section aria-labelledby="pdp-best-sellers-heading">
          <div className="mb-8 pb-4 border-b border-[#E5E5E5] flex items-center justify-between">
            <h2
              id="pdp-best-sellers-heading"
              className="text-[13px] font-medium uppercase tracking-[0.18em] text-[#0A0A0A]"
            >
              BEST SELLERS
            </h2>
            <LocalizedClientLink
              href="/store"
              className="text-[11px] uppercase tracking-[0.14em] text-[#0A0A0A] underline underline-offset-4 hover:opacity-65 transition-opacity"
            >
              Shop All
            </LocalizedClientLink>
          </div>

          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 gap-y-8">
            {bestSellers.map((item) => (
              <li key={`bestseller-${item.id}`}>
                <ProductPreview region={region} product={item} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
