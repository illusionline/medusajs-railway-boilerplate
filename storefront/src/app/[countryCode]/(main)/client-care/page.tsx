import { EditorialReveal } from "@modules/common/components/motion"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Client Care & Atelier Guide",
  description:
    "Worldwide DHL Express Shipping, Made-to-Measure Tailoring Guide, and ILLUSIONLINE Client Concierge.",
}

export default function ClientCarePage() {
  return (
    <div className="bg-[#FAF9F6] text-[#0A0A0A] py-16 small:py-28">
      <div className="content-container max-w-4xl">
        <EditorialReveal>
          <span className="block text-[11px] uppercase tracking-[0.3em] text-[#0A0A0A]/50 mb-4">
            ILLUSIONLINE ATELIER
          </span>
          <h1 className="font-display text-4xl small:text-6xl font-light tracking-wide text-[#0A0A0A] mb-6">
            Client Care &amp; Bespoke Guide
          </h1>
          <p className="text-sm small:text-base text-[#0A0A0A]/70 leading-relaxed max-w-2xl">
            Every ILLUSIONLINE silhouette is cut with architectural precision
            and inspected individually in our atelier prior to dispatch.
          </p>
        </EditorialReveal>

        <div className="mt-16 divide-y divide-[#0A0A0A]/15 border-t border-b border-[#0A0A0A]/15">
          {/* Worldwide DHL Express Shipping */}
          <EditorialReveal>
            <section id="shipping" className="py-12 small:py-16 scroll-mt-24">
              <div className="grid grid-cols-1 small:grid-cols-[260px_1fr] gap-8">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.26em] text-[#0A0A0A]/45 block mb-2">
                    01 / Logistics
                  </span>
                  <h2 className="font-display text-2xl small:text-3xl font-light text-[#0A0A0A]">
                    Worldwide DHL Express Shipping
                  </h2>
                </div>
                <div className="space-y-4 text-sm text-[#0A0A0A]/75 leading-relaxed">
                  <p>
                    All ILLUSIONLINE orders ship insured via{" "}
                    <strong className="font-medium text-[#0A0A0A]">
                      DHL Express Worldwide
                    </strong>{" "}
                    in protective structured garment packaging.
                  </p>
                  <ul className="space-y-2 text-xs text-[#0A0A0A]/70 border-l border-[#0A0A0A]/20 pl-4">
                    <li>
                      <strong className="text-[#0A0A0A] font-medium">
                        UAE &amp; GCC:
                      </strong>{" "}
                      1–2 business days from dispatch.
                    </li>
                    <li>
                      <strong className="text-[#0A0A0A] font-medium">
                        Europe, UK &amp; North America:
                      </strong>{" "}
                      2–4 business days via DHL Express Air.
                    </li>
                    <li>
                      <strong className="text-[#0A0A0A] font-medium">
                        Rest of World:
                      </strong>{" "}
                      3–5 business days with real-time signature tracking.
                    </li>
                  </ul>
                  <p className="text-xs text-[#0A0A0A]/55">
                    Ready-to-wear pieces dispatch within 2–3 business days.
                    Made-to-Measure creations require 10–14 business days of
                    atelier craftsmanship prior to express couriering.
                  </p>
                </div>
              </div>
            </section>
          </EditorialReveal>

          {/* Made-to-Measure Guide */}
          <EditorialReveal>
            <section
              id="made-to-measure"
              className="py-12 small:py-16 scroll-mt-24"
            >
              <div className="grid grid-cols-1 small:grid-cols-[260px_1fr] gap-8">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.26em] text-[#0A0A0A]/45 block mb-2">
                    02 / Bespoke Fit
                  </span>
                  <h2 className="font-display text-2xl small:text-3xl font-light text-[#0A0A0A]">
                    Made-to-Measure Guide
                  </h2>
                </div>
                <div className="space-y-5 text-sm text-[#0A0A0A]/75 leading-relaxed">
                  <p>
                    Selecting{" "}
                    <strong className="font-medium text-[#0A0A0A]">
                      Made-to-Measure
                    </strong>{" "}
                    on any product page allows our patternmakers to draft and
                    drape your gown to your exact proportions. Measure over
                    light undergarments using a soft centimetre tape held snug
                    and parallel to the floor:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 border border-[#0A0A0A]/10 bg-[#F2EFE9]/40">
                      <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#0A0A0A] block mb-1">
                        Bust (cm)
                      </span>
                      <p className="text-xs text-[#0A0A0A]/65">
                        Measure around the fullest part of your bust, keeping
                        the tape level across your back.
                      </p>
                    </div>
                    <div className="p-4 border border-[#0A0A0A]/10 bg-[#F2EFE9]/40">
                      <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#0A0A0A] block mb-1">
                        Waist (cm)
                      </span>
                      <p className="text-xs text-[#0A0A0A]/65">
                        Measure around the narrowest natural crease of your
                        waistline without drawing the tape tight.
                      </p>
                    </div>
                    <div className="p-4 border border-[#0A0A0A]/10 bg-[#F2EFE9]/40">
                      <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#0A0A0A] block mb-1">
                        Hips (cm)
                      </span>
                      <p className="text-xs text-[#0A0A0A]/65">
                        Stand with heels together and measure around the fullest
                        contour of the hips.
                      </p>
                    </div>
                    <div className="p-4 border border-[#0A0A0A]/10 bg-[#F2EFE9]/40">
                      <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#0A0A0A] block mb-1">
                        Hollow to Hem &amp; Height (cm)
                      </span>
                      <p className="text-xs text-[#0A0A0A]/65">
                        Measure from the collarbone hollow straight down to your
                        desired hemline (wearing your intended evening heels),
                        alongside bare total height.
                      </p>
                    </div>
                  </div>
                  <p className="text-xs italic text-[#0A0A0A]/65">
                    Complimentary minor tailoring adjustments are included on
                    all Made-to-Measure commissions.
                  </p>
                </div>
              </div>
            </section>
          </EditorialReveal>

          {/* Client Concierge */}
          <EditorialReveal>
            <section id="concierge" className="py-12 small:py-16 scroll-mt-24">
              <div className="grid grid-cols-1 small:grid-cols-[260px_1fr] gap-8">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.26em] text-[#0A0A0A]/45 block mb-2">
                    03 / Private Assistance
                  </span>
                  <h2 className="font-display text-2xl small:text-3xl font-light text-[#0A0A0A]">
                    Client Concierge
                  </h2>
                </div>
                <div className="space-y-4 text-sm text-[#0A0A0A]/75 leading-relaxed">
                  <p>
                    Our Client Concierge assists with urgent red-carpet or gala
                    event timelines, virtual measurement consultations, and
                    bespoke silhouette inquiries.
                  </p>
                  <div className="p-5 border border-[#0A0A0A]/15 bg-[#0A0A0A] text-[#FAF9F6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.24em] text-[#FAF9F6]/55 block mb-1">
                        Atelier Direct Desk
                      </span>
                      <a
                        href="mailto:concierge@illusionline.com"
                        className="font-display text-xl tracking-wide text-[#FAF9F6] hover:opacity-80 transition-opacity"
                      >
                        concierge@illusionline.com
                      </a>
                    </div>
                    <LocalizedClientLink
                      href="/store"
                      className="px-6 py-3 border border-[#FAF9F6]/30 text-[11px] uppercase tracking-[0.22em] text-[#FAF9F6] hover:bg-[#FAF9F6] hover:text-[#0A0A0A] transition-colors text-center"
                    >
                      Explore Eveningwear
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>
            </section>
          </EditorialReveal>
        </div>
      </div>
    </div>
  )
}
