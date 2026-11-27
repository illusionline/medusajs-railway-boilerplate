import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type PolicyEntry = {
  kicker: string
  title: string
  updated: string
  sections: Array<{
    heading: string
    paragraphs: string[]
  }>
}

const POLICIES: Record<string, PolicyEntry> = {
  "refund-policy": {
    kicker: "ATELIER POLICY",
    title: "Refund & Returns Policy",
    updated: "Updated for 2026 Season",
    sections: [
      {
        heading: "1. Atelier Production & Order Finality",
        paragraphs: [
          "Standard/Made-to-Order and Made-to-Measure garments are individually cut and finished in our Dubai atelier and require up to 6–8 weeks production unless explicitly marked Ready-to-Ship.",
          "Because fabric cutting and pattern preparation begin upon order confirmation, orders cannot be cancelled or modified once placed.",
        ],
      },
      {
        heading: "2. Made-to-Measure Commissions (Final Sale)",
        paragraphs: [
          "All Made-to-Measure / Custom-proportioned garments crafted to client-submitted bust, waist, hip, hollow-to-hem, or height specifications are strictly final sale and are not eligible for return, refund, or exchange.",
        ],
      },
      {
        heading: "3. Standard-Size Store Credit Eligibility",
        paragraphs: [
          "Eligible unworn, unaltered standard-size garments with original atelier security tags intact may be requested for return within 7 days of delivery for ILLUSIONLINE Store Credit only (excluding shipping and duties).",
          "To initiate a return authorization request, contact support@illusionline.com with your Order Confirmation number.",
        ],
      },
    ],
  },
  "shipping-policy": {
    kicker: "LOGISTICS & DISPATCH",
    title: "Shipping & International Customs Policy",
    updated: "Updated for 2026 Season",
    sections: [
      {
        heading: "1. UAE Courier & Worldwide DHL Express",
        paragraphs: [
          "ILLUSIONLINE provides Complimentary Courier Delivery across the United Arab Emirates (1–2 business days from dispatch) and insured Worldwide DHL Express shipping at a flat rate of AED 99 (2–5 business days from dispatch).",
        ],
      },
      {
        heading: "2. International Customs, Duties & Taxes (DDU)",
        paragraphs: [
          "International orders outside the UAE ship DDU (Delivered Duty Unpaid). Destination import duties, local VAT/GST, customs taxes, and brokerage clearance fees are the sole responsibility of the recipient.",
          "Refusal, delay, or non-payment of destination import duties resulting in carrier hold, return-to-origin, or customs abandonment is strictly non-refundable.",
        ],
      },
    ],
  },
  "terms-of-service": {
    kicker: "LEGAL TERMS",
    title: "Terms of Service",
    updated: "Updated for 2026 Season",
    sections: [
      {
        heading: "1. Currency of Settlement (AED)",
        paragraphs: [
          "All transactions on ILLUSIONLINE are processed and settled strictly in United Arab Emirates Dirhams (AED). Any foreign currency figures displayed on the storefront (including USD, EUR, GBP, SAR, KWD, QAR, or IRT) are approximate informational estimates only.",
        ],
      },
      {
        heading: "2. Bespoke Specification Accuracy",
        paragraphs: [
          "Clients commissioning Made-to-Measure garments are responsible for verifying the accuracy of submitted measurements (in centimetres) prior to checkout. Complimentary minor atelier tailoring adjustments are available upon inquiry via support@illusionline.com.",
        ],
      },
      {
        heading: "3. Intellectual Property",
        paragraphs: [
          "All garment designs, photography, editorial layouts, and trademarks displayed on ILLUSIONLINE are the exclusive property of ILLUSIONLINE and may not be reproduced without written consent.",
        ],
      },
    ],
  },
  "privacy-policy": {
    kicker: "DATA PROTECTION",
    title: "Privacy Policy",
    updated: "Updated for 2026 Season",
    sections: [
      {
        heading: "1. Client Information & Bespoke Records",
        paragraphs: [
          "We collect only the personal information required to craft, fulfill, and support your order—including contact details, delivery addresses, and bespoke tailoring measurements.",
        ],
      },
      {
        heading: "2. Payment Security",
        paragraphs: [
          "Card and Apple Pay transactions are processed over encrypted PCI-DSS compliant hosted payment infrastructure via Network International (N-Genius Online). ILLUSIONLINE never stores raw payment card numbers.",
        ],
      },
      {
        heading: "3. Concierge & Privacy Inquiries",
        paragraphs: [
          "To request access to or deletion of your personal client profile, please contact our team at support@illusionline.com.",
        ],
      },
    ],
  },
}

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const policy = POLICIES[slug]
  if (!policy) {
    return { title: "Policy" }
  }
  return {
    title: policy.title,
    description: `${policy.title} — ILLUSIONLINE Architectural Eveningwear.`,
  }
}

export default async function PolicyPage(props: Props) {
  const { slug } = await props.params
  const policy = POLICIES[slug]

  if (!policy) {
    notFound()
  }

  return (
    <div className="bg-white text-[#0A0A0A] py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <div className="border-b border-[#E5E5E5] pb-8 mb-10">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-[#0A0A0A]/50 mb-3">
            {policy.kicker}
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl md:text-4xl uppercase tracking-[0.06em] font-medium text-[#0A0A0A]">
            {policy.title}
          </h1>
          <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[#0A0A0A]/45">
            {policy.updated}
          </p>
        </div>

        <div className="space-y-10">
          {policy.sections.map((section) => (
            <section key={section.heading} className="space-y-3">
              <h2 className="text-xs uppercase tracking-[0.14em] font-semibold text-[#0A0A0A]">
                {section.heading}
              </h2>
              {section.paragraphs.map((p, idx) => (
                <p
                  key={idx}
                  className="text-xs sm:text-sm leading-relaxed text-[#0A0A0A]/75"
                >
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-[#E5E5E5] flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-[#0A0A0A]/65">
            Questions? Contact{" "}
            <a
              href="mailto:support@illusionline.com"
              className="text-[#0A0A0A] underline underline-offset-4"
            >
              support@illusionline.com
            </a>
          </div>
          <LocalizedClientLink
            href="/store"
            className="px-6 py-3 bg-[#0A0A0A] text-white text-[11px] uppercase tracking-[0.16em] font-medium hover:bg-black/85 transition-colors"
          >
            Continue Shopping
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
