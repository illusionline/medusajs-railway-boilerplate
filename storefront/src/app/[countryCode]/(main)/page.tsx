import { Metadata } from "next"

import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  EditorialItem,
  EditorialReveal,
  EditorialStagger,
} from "@modules/common/components/motion"
import Hero from "@modules/home/components/hero"
import ProductPreview from "@modules/products/components/product-preview"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "ILLUSIONLINE — Architectural Eveningwear",
  description:
    "Architectural Eveningwear — Ready-to-Wear & Bespoke Made-to-Measure.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: {
      limit: 12,
    },
  }).catch(() => ({
    response: { products: [], count: 0 },
  }))

  return (
    <div className="bg-[#FAF9F6] text-[#0A0A0A]">
      <Hero />

      {/* Curated 4:5 Portrait Showcase Grid */}
      <section className="py-20 small:py-32">
        <div className="content-container">
          <EditorialReveal className="flex flex-col small:flex-row small:items-end justify-between gap-6 mb-14 pb-6 border-b border-[#0A0A0A]/10">
            <div>
              <span className="block text-[10px] uppercase tracking-[0.3em] text-[#0A0A0A]/45 mb-2">
                Curated Edition
              </span>
              <h2 className="font-display text-3xl small:text-5xl font-light tracking-wide text-[#0A0A0A]">
                Eveningwear Silhouettes
              </h2>
            </div>
            <LocalizedClientLink
              href="/store"
              className="group inline-flex items-center gap-x-2 text-[11px] uppercase tracking-[0.24em] text-[#0A0A0A]/75 hover:text-[#0A0A0A] transition-colors"
            >
              <span>View All Pieces</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </LocalizedClientLink>
          </EditorialReveal>

          {products && products.length > 0 ? (
            <EditorialStagger className="grid grid-cols-2 small:grid-cols-3 large:grid-cols-4 gap-x-5 small:gap-x-7 gap-y-12 small:gap-y-16">
              {products.map((product) => (
                <EditorialItem key={product.id}>
                  <ProductPreview
                    product={product}
                    region={region}
                    isFeatured
                  />
                </EditorialItem>
              ))}
            </EditorialStagger>
          ) : (
            <EditorialReveal className="py-20 text-center border border-[#0A0A0A]/10 bg-[#F2EFE9]/35 px-6">
              <p className="font-display text-2xl font-light text-[#0A0A0A] mb-2">
                New Season Pieces Arriving Shortly
              </p>
              <p className="text-xs text-[#0A0A0A]/60 max-w-md mx-auto leading-relaxed mb-6">
                Our latest architectural eveningwear collection is being
                prepared in the atelier.
              </p>
              <LocalizedClientLink
                href="/client-care#concierge"
                className="inline-block px-7 py-3 border border-[#0A0A0A] text-[11px] uppercase tracking-[0.22em] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#FAF9F6] transition-colors"
              >
                Contact Client Concierge
              </LocalizedClientLink>
            </EditorialReveal>
          )}
        </div>
      </section>

      {/* Architectural Bespoke Atelier Strip */}
      <section className="bg-[#0A0A0A] text-[#FAF9F6] border-t border-[#1A1A1A] py-20 small:py-28">
        <div className="content-container">
          <EditorialReveal className="grid grid-cols-1 small:grid-cols-3 gap-12 small:gap-0 small:divide-x divide-[#1A1A1A]">
            <div className="small:pr-10">
              <span className="block text-[10px] uppercase tracking-[0.28em] text-[#FAF9F6]/45 mb-3">
                01 / Ready-to-Wear
              </span>
              <h3 className="font-display text-2xl font-light text-[#FAF9F6] mb-3">
                Sculptural Precision
              </h3>
              <p className="text-xs text-[#FAF9F6]/65 leading-relaxed">
                Cut in standard atelier sizing from XS to XL with internal
                boning and fluid silk-crepe draping engineered for effortless
                movement.
              </p>
            </div>

            <div className="small:px-10">
              <span className="block text-[10px] uppercase tracking-[0.28em] text-[#FAF9F6]/45 mb-3">
                02 / Bespoke Atelier
              </span>
              <h3 className="font-display text-2xl font-light text-[#FAF9F6] mb-3">
                Made-to-Measure
              </h3>
              <p className="text-xs text-[#FAF9F6]/65 leading-relaxed">
                Select Made-to-Measure on any gown to submit your individual
                bust, waist, hip, and hollow-to-hem specifications with
                complimentary minor tailoring adjustments.
              </p>
            </div>

            <div className="small:pl-10">
              <span className="block text-[10px] uppercase tracking-[0.28em] text-[#FAF9F6]/45 mb-3">
                03 / Global Dispatch
              </span>
              <h3 className="font-display text-2xl font-light text-[#FAF9F6] mb-3">
                Worldwide DHL Express
              </h3>
              <p className="text-xs text-[#FAF9F6]/65 leading-relaxed">
                Delivered worldwide in structured atelier garment presentation
                boxes with insured express courier tracking to your door.
              </p>
            </div>
          </EditorialReveal>
        </div>
      </section>
    </div>
  )
}
