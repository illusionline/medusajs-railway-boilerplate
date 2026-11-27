import { Suspense } from "react"

import { HttpTypes } from "@medusajs/types"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="py-12 md:py-16 max-w-[1440px] mx-auto px-4 md:px-8 bg-white text-[#0A0A0A]">
      <div className="mb-10 pb-6 border-b border-[#E5E5E5]">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-[#0A0A0A]/50 mb-2">
          COLLECTION
        </span>
        <h1 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-medium uppercase tracking-[0.06em] text-[#0A0A0A]">
          {collection.title}
        </h1>
      </div>

      <div className="flex flex-col small:flex-row small:items-start gap-x-10">
        <RefinementList sortBy={sort} />
        <div className="w-full">
          <Suspense
            fallback={
              <SkeletonProductGrid
                numberOfProducts={collection.products?.length}
              />
            }
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              collectionId={collection.id}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
