import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  filter,
  searchQuery,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  filter?: string
  searchQuery?: string
  countryCode: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 100,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products: allFetchedProducts },
  } = await listProductsWithSort({
    page: 1,
    queryParams,
    sortBy,
    countryCode,
  })

  let filteredProducts = allFetchedProducts

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase()
    filteredProducts = filteredProducts.filter((p) => {
      const hay = `${p.title || ""} ${p.subtitle || ""} ${p.description || ""} ${
        p.handle || ""
      }`.toLowerCase()
      return hay.includes(q)
    })
  } else if (filter === "noir-edit") {
    const noirMatches = filteredProducts.filter((p) => {
      const hay = `${p.title || ""} ${p.subtitle || ""} ${p.description || ""} ${
        p.handle || ""
      }`.toLowerCase()
      return (
        hay.includes("noir") ||
        hay.includes("black") ||
        hay.includes("onyx") ||
        hay.includes("midnight") ||
        hay.includes("obsidian")
      )
    })
    if (noirMatches.length > 0) {
      filteredProducts = noirMatches
    }
  } else if (filter === "made-to-measure") {
    const mtmMatches = filteredProducts.filter((p) =>
      p.variants?.some(
        (v) =>
          v.title?.toLowerCase().includes("custom") ||
          v.options?.some((o) => o.value?.toLowerCase().includes("custom"))
      )
    )
    if (mtmMatches.length > 0) {
      filteredProducts = mtmMatches
    }
  }

  const totalCount = filteredProducts.length
  const totalPages = Math.ceil(totalCount / PRODUCT_LIMIT)
  const offset = Math.max(0, (page - 1) * PRODUCT_LIMIT)
  const paginated = filteredProducts.slice(offset, offset + PRODUCT_LIMIT)

  if (paginated.length === 0) {
    return (
      <div className="py-16 px-6 border border-[#E5E5E5] bg-[#F7F7F5] text-center">
        <p className="font-editorial text-lg uppercase tracking-[0.08em] font-medium text-[#0A0A0A] mb-2">
          No Matching Silhouettes Found
        </p>
        <p className="text-xs text-[#0A0A0A]/65 mb-6">
          Explore the complete ILLUSIONLINE eveningwear archive below.
        </p>
        <LocalizedClientLink
          href="/store"
          className="inline-block px-6 py-3 bg-[#0A0A0A] text-white text-[11px] uppercase tracking-[0.16em] font-medium"
        >
          View All Dresses
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <>
      <ul
        className="grid grid-cols-2 w-full lg:grid-cols-4 gap-3 md:gap-4 gap-y-8 md:gap-y-10"
        data-testid="products-list"
      >
        {paginated.map((p) => {
          return (
            <li key={p.id}>
              <ProductPreview product={p} region={region} />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
