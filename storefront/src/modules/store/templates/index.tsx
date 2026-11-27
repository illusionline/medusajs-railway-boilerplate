import { Suspense } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const FILTER_META: Record<
  string,
  { kicker: string; title: string; subtitle: string }
> = {
  "new-arrivals": {
    kicker: "LATEST RELEASE",
    title: "New Arrivals",
    subtitle:
      "Newly unveiled architectural eveningwear crafted in standard sizing and bespoke made-to-measure.",
  },
  "evening-gowns": {
    kicker: "ILLUSIONLINE ATELIER",
    title: "Evening Gowns",
    subtitle:
      "Floor-sweeping sculptural silhouettes engineered with internal corset structure and fluid drape.",
  },
  "noir-edit": {
    kicker: "CURATED CAPSULE",
    title: "The Noir Edit",
    subtitle:
      "Monochrome black and nocturnal eveningwear statements designed for dramatic entrances.",
  },
  "made-to-measure": {
    kicker: "BESPOKE ATELIER",
    title: "Made-to-Measure",
    subtitle:
      "Every gown below can be commissioned to your exact bust, waist, hip, and hollow-to-hem proportions.",
  },
}

const StoreTemplate = ({
  sortBy,
  page,
  filter,
  searchQuery,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  filter?: string
  searchQuery?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const activeMeta = filter ? FILTER_META[filter] : undefined

  const kicker = searchQuery
    ? "SEARCH RESULTS"
    : activeMeta?.kicker || "ILLUSIONLINE ARCHIVE"
  const heading = searchQuery
    ? `"${searchQuery}"`
    : activeMeta?.title || "All Dresses"
  const subtitle = searchQuery
    ? "Showing matching eveningwear silhouettes from the ILLUSIONLINE catalog."
    : activeMeta?.subtitle ||
      "Every gown is available in standard atelier sizing and bespoke made-to-measure tailoring."

  return (
    <div
      className="py-12 md:py-16 max-w-[1440px] mx-auto px-4 md:px-8 bg-white text-[#0A0A0A]"
      data-testid="category-container"
    >
      <div className="mb-10 pb-6 border-b border-[#E5E5E5] flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="block text-[10px] uppercase tracking-[0.2em] text-[#0A0A0A]/50 mb-2">
            {kicker}
          </span>
          <h1
            className="font-editorial text-2xl sm:text-3xl md:text-4xl font-medium uppercase tracking-[0.06em] text-[#0A0A0A]"
            data-testid="store-page-title"
          >
            {heading}
          </h1>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2">
          <p className="text-xs text-[#0A0A0A]/65 max-w-sm leading-relaxed md:text-right">
            {subtitle}
          </p>
          {filter === "made-to-measure" && (
            <LocalizedClientLink
              href="/client-care#made-to-measure"
              className="text-[11px] uppercase tracking-[0.14em] text-[#0A0A0A] underline underline-offset-4"
            >
              View Measurement Guide
            </LocalizedClientLink>
          )}
        </div>
      </div>

      <div className="flex flex-col small:flex-row small:items-start gap-x-10">
        <RefinementList sortBy={sort} />
        <div className="w-full">
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              filter={filter}
              searchQuery={searchQuery}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
