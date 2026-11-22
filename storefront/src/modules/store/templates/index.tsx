import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div
      className="py-12 small:py-20 content-container bg-[#FAF9F6]"
      data-testid="category-container"
    >
      <div className="mb-12 pb-6 border-b border-[#0A0A0A]/10 flex flex-col small:flex-row small:items-end justify-between gap-6">
        <div>
          <span className="block text-[10px] uppercase tracking-[0.3em] text-[#0A0A0A]/45 mb-2">
            ILLUSIONLINE ATELIER
          </span>
          <h1
            className="font-display text-4xl small:text-5xl font-light tracking-wide text-[#0A0A0A]"
            data-testid="store-page-title"
          >
            Eveningwear Collection
          </h1>
        </div>
        <p className="text-xs text-[#0A0A0A]/60 max-w-sm leading-relaxed">
          Every gown is available in standard atelier sizing and bespoke
          made-to-measure tailoring.
        </p>
      </div>

      <div className="flex flex-col small:flex-row small:items-start gap-x-10">
        <RefinementList sortBy={sort} />
        <div className="w-full">
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
