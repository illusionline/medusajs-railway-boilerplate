import { Metadata } from "next"
import Image from "next/image"

import IllusionLogo from "@components/brand/illusion-logo"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import {
  cleanEditorialDescription,
  stripCatalogIdentifiers,
} from "@lib/util/clean-editorial-text"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: {
    absolute: "ILLUSION — Official Online Atelier | illusionline.com",
  },
  description:
    "ILLUSION (@illusion.line) — Official Online Atelier at illusionline.com. Architectural Eveningwear in Ready-to-Wear & Bespoke Made-to-Measure.",
}

const FALLBACK_EDITORIAL_IMAGE = "/images/hero-editorial.jpg"

type EditorialOverlayPosition =
  | "top-left"
  | "bottom-left"
  | "top-right"
  | "bottom-right"

function pickProduct(
  products: HttpTypes.StoreProduct[],
  index: number
): HttpTypes.StoreProduct | null {
  if (!products || products.length === 0) {
    return null
  }
  const safeIndex =
    ((index % products.length) + products.length) % products.length
  return products[safeIndex] || products[0]
}

function getUniqueProductImages(
  product: HttpTypes.StoreProduct | null
): string[] {
  if (!product) return [FALLBACK_EDITORIAL_IMAGE]
  const raw = [
    product.thumbnail,
    ...(product.images?.map((img) => img?.url) || []),
  ].filter((url): url is string => Boolean(url && url.trim()))

  const unique = Array.from(new Set(raw))
  return unique.length > 0 ? unique : [FALLBACK_EDITORIAL_IMAGE]
}

function getSlotImage(
  products: HttpTypes.StoreProduct[],
  slotIndex: number
): string {
  const product = pickProduct(products, slotIndex)
  const imgs = getUniqueProductImages(product)
  if (!products.length) return imgs[0]
  const wrapPass = Math.floor(slotIndex / products.length)
  return imgs[wrapPass % imgs.length] || imgs[0]
}

function getProductHref(product: HttpTypes.StoreProduct | null): string {
  if (product?.handle) {
    return `/products/${product.handle}`
  }
  return "/store"
}

function getCleanTitle(
  product: HttpTypes.StoreProduct | null,
  fallback: string
): string {
  const cleaned = stripCatalogIdentifiers(product?.title)
  return cleaned || fallback
}

function getCleanCaption(
  product: HttpTypes.StoreProduct | null,
  fallback: string,
  maxLength = 102
): string {
  const fromSubtitle = cleanEditorialDescription(product?.subtitle, maxLength)
  if (fromSubtitle) return fromSubtitle

  const fromDescription = cleanEditorialDescription(
    product?.description,
    maxLength
  )
  if (fromDescription) return fromDescription

  return fallback
}

function resolveEditorialOverlay(
  product: HttpTypes.StoreProduct | null,
  defaults: {
    title: string
    subtitle: string
    defaultPosition?: EditorialOverlayPosition
  }
): {
  title: string
  subtitle: string
  position: EditorialOverlayPosition
} {
  const meta =
    product?.metadata && typeof product.metadata === "object"
      ? (product.metadata as Record<string, unknown>)
      : null

  const rawOverrideTitle =
    typeof meta?.editorial_title === "string"
      ? stripCatalogIdentifiers(meta.editorial_title.replace(/\\n/g, "\n"))
      : ""

  const rawOverrideSubtitle =
    typeof meta?.editorial_subtitle === "string"
      ? stripCatalogIdentifiers(meta.editorial_subtitle.replace(/\\n/g, "\n"))
      : ""

  const rawPosition =
    typeof meta?.editorial_position === "string"
      ? meta.editorial_position.trim().toLowerCase()
      : ""

  const validPosition: EditorialOverlayPosition =
    rawPosition === "bottom-left" ||
    rawPosition === "top-right" ||
    rawPosition === "bottom-right" ||
    rawPosition === "top-left"
      ? rawPosition
      : defaults.defaultPosition || "top-left"

  return {
    title: rawOverrideTitle || getCleanTitle(product, defaults.title),
    subtitle:
      rawOverrideSubtitle || getCleanCaption(product, defaults.subtitle, 96),
    position: validPosition,
  }
}

/**
 * Reusable Full-Bleed Editorial Safe-Zone Panel (Option A + Option C + Option D):
 * - Strict narrow safe-zone column (`195px–235px`) at FWRD `clamp(21px, 2.0vw, 28px)` scale
 * - Desktop rightward focal nudge (`objectPosition: "64% 16%"` + subtle `scale(1.06) translateX(3%)`)
 *   with directional edge-only scrim so the model's face & gown are never darkened or covered
 * - Mobile (`<md`) bottom-left safe-zone (`bottom-6 left-5 max-w-[78%]`) keeping `object-top` face clear
 * - Full support for `product.metadata` overrides (`editorial_title`, `editorial_subtitle`, `editorial_position`)
 */
function FullBleedEditorialPanel({
  href,
  imageSrc,
  imageAlt,
  kicker,
  title,
  subtitle,
  ctaLabel,
  position = "top-left",
  isHero = false,
  priority = false,
  className,
}: {
  href: string
  imageSrc: string
  imageAlt: string
  kicker: string
  title: string
  subtitle: string
  ctaLabel: string
  position?: EditorialOverlayPosition
  isHero?: boolean
  priority?: boolean
  className?: string
}) {
  const isRight = position === "top-right" || position === "bottom-right"
  const isBottom = position === "bottom-left" || position === "bottom-right"

  const HeadingTag = isHero ? "h1" : "h2"

  return (
    <LocalizedClientLink
      href={href}
      aria-label={`${ctaLabel} — ${imageAlt}`}
      className={clx(
        "group relative block w-full overflow-hidden bg-[#0A0A0A]",
        isHero
          ? "h-[76vh] lg:h-[84vh] min-h-[520px]"
          : "min-h-[600px] lg:min-h-[760px]",
        className
      )}
    >
      {/* Gown Photography with Option C Subject Focal Nudge on Desktop */}
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority={priority}
        quality={90}
        sizes={isHero ? "100vw" : "(max-width: 1024px) 100vw, 50vw"}
        className={clx(
          "object-cover object-top transition-transform duration-700 ease-luxury",
          isRight
            ? "md:object-[36%_16%] md:scale-[1.06] md:-translate-x-[3%] md:group-hover:scale-[1.075]"
            : "md:object-[64%_16%] md:scale-[1.06] md:translate-x-[3%] md:group-hover:scale-[1.075]"
        )}
      />

      {/* Mobile (<md) Bottom-Only Scrim for Bottom-Left Face Protection */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[56%] bg-gradient-to-t from-black/68 via-black/24 to-transparent md:hidden" />

      {/* Desktop (>=md) Narrow Edge-Only Safe-Zone Scrim (Never Darkens Model's Skin/Gown) */}
      <div
        className={clx(
          "pointer-events-none hidden md:block absolute inset-y-0 w-[52%]",
          isRight
            ? "right-0 bg-gradient-to-l from-black/45 via-black/15 to-transparent"
            : "left-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent"
        )}
      />

      {/* Safe-Zone Copy Container:
          - Mobile (<md): anchored bottom-left (bottom-6 left-5 max-w-[78%]) away from face
          - Desktop (>=md): anchored in strict narrow architectural wall column */}
      <div
        className={clx(
          "absolute z-10 flex flex-col text-white",
          "bottom-6 left-5 max-w-[78%] text-left items-start",
          isRight
            ? "md:left-auto md:right-10 lg:right-12 md:max-w-none md:text-right md:items-end"
            : "md:left-10 lg:left-12 md:max-w-none md:text-left md:items-start",
          isBottom
            ? "md:top-auto md:bottom-12 lg:bottom-14"
            : "md:bottom-auto md:top-12 lg:top-14"
        )}
      >
        <span className="block text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white/85 mb-2.5">
          {kicker}
        </span>

        <HeadingTag
          style={{
            fontFamily: "var(--font-editorial)",
            fontSize: isHero
              ? "clamp(23px, 2.3vw, 32px)"
              : "clamp(21px, 2.0vw, 28px)",
          }}
          className={clx(
            "font-medium uppercase leading-[1.12] tracking-[0.04em] text-white whitespace-pre-line",
            isHero
              ? "max-w-[250px] md:max-w-[235px] lg:max-w-[265px] xl:max-w-[290px]"
              : "max-w-[235px] sm:max-w-[215px] md:max-w-[195px] lg:max-w-[205px] xl:max-w-[235px]"
          )}
        >
          {title}
        </HeadingTag>

        <p
          className={clx(
            "mt-3 text-[12px] leading-[1.45] text-white/85 whitespace-pre-line",
            isHero
              ? "max-w-[240px] md:max-w-[215px] xl:max-w-[245px]"
              : "max-w-[225px] sm:max-w-[205px] md:max-w-[185px] lg:max-w-[195px] xl:max-w-[220px]"
          )}
        >
          {subtitle}
        </p>

        <span className="mt-5 inline-block text-[11px] uppercase tracking-[0.16em] font-medium text-white underline underline-offset-[6px] decoration-white/85 group-hover:decoration-white">
          {ctaLabel}
        </span>
      </div>
    </LocalizedClientLink>
  )
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
      limit: 24,
      fields:
        "*images,*collection,*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags",
    },
  }).catch(() => ({
    response: { products: [], count: 0 },
  }))

  // Assign distinct products across editorial slots (safe modulo wrap if < 12)
  const p0 = pickProduct(products, 0)
  const p1 = pickProduct(products, 1)
  const p2 = pickProduct(products, 2)
  const p3 = pickProduct(products, 3)
  const p4 = pickProduct(products, 4)
  const p5 = pickProduct(products, 5)
  const p6 = pickProduct(products, 6)
  const p7 = pickProduct(products, 7)

  // Resolve Safe-Zone Editorial Overlays (with Option D Medusa metadata support)
  const heroOverlay = resolveEditorialOverlay(p0, {
    title: "ARCHITECTURAL\nEVENINGWEAR",
    subtitle:
      "Crafted in standard atelier sizing\nand bespoke made-to-measure.",
    defaultPosition: "top-left",
  })

  const spotlightOverlay = resolveEditorialOverlay(p1, {
    title: "SCULPTED\nCORSETRY",
    subtitle:
      "Internal couture boning balanced\nwith fluid evening drape.",
    defaultPosition: "top-left",
  })

  const mtmOverlay = resolveEditorialOverlay(p4, {
    title: "BESPOKE\nPROPORTIONS",
    subtitle:
      "Tailored in our atelier to your exact\nproportions or standard sizing.",
    defaultPosition: "top-left",
  })

  // Force bespoke message on Block #2 Right unless explicitly overridden via metadata.editorial_subtitle
  const p4HasExplicitSubtitle =
    p4?.metadata &&
    typeof (p4.metadata as Record<string, unknown>).editorial_subtitle ===
      "string" &&
    Boolean(
      String(
        (p4.metadata as Record<string, unknown>).editorial_subtitle
      ).trim()
    )
  const mtmSubtitle = p4HasExplicitSubtitle
    ? mtmOverlay.subtitle
    : "Tailored in our atelier to your exact\nproportions or standard sizing."

  // New Arrivals (4-Up Portrait Row)
  const newArrivalProducts: HttpTypes.StoreProduct[] =
    products.length >= 4
      ? products.slice(0, 4)
      : products.length > 0
      ? [0, 1, 2, 3]
          .map((idx) => pickProduct(products, idx))
          .filter((p): p is HttpTypes.StoreProduct => Boolean(p))
      : []

  // Diptych Selection: prefer a gown starting around slot 8 with >=2 distinct angles
  let diptychProduct: HttpTypes.StoreProduct | null = pickProduct(products, 8)
  if (products.length > 0) {
    for (let offset = 0; offset < products.length; offset++) {
      const candidate = pickProduct(products, 8 + offset)
      if (candidate && getUniqueProductImages(candidate).length >= 2) {
        diptychProduct = candidate
        break
      }
    }
  }
  const diptychImages = getUniqueProductImages(diptychProduct)
  const diptychLeftImg = diptychImages[0] || FALLBACK_EDITORIAL_IMAGE
  const diptychRightImg =
    diptychImages[1] || getSlotImage(products, 9) || diptychLeftImg
  const diptychCleanTitle = getCleanTitle(diptychProduct, "")

  // Best Sellers (8-Up when >=8 products exist, otherwise 4-Up)
  const bestSellerProducts: HttpTypes.StoreProduct[] =
    products.length >= 8
      ? [...products.slice(4, 8), ...products.slice(0, 4)]
      : products.length >= 4
      ? [
          ...products.slice(Math.min(2, products.length - 1)),
          ...products.slice(0, Math.min(2, products.length - 1)),
        ].slice(0, 4)
      : products

  const p2Images = getUniqueProductImages(p2)
  const p3Images = getUniqueProductImages(p3)

  const tripleStripItems = [
    {
      product: p5,
      image: getSlotImage(products, 5),
      fallbackCopy:
        "Architectural corsetry balanced with fluid floor-length evening drape.",
      cta: "Shop Gown",
    },
    {
      product: p6,
      image: getSlotImage(products, 6),
      fallbackCopy:
        "Sculpted nocturnal lines crafted in standard and bespoke proportions.",
      cta: "Shop the Edit",
    },
    {
      product: p7,
      image: getSlotImage(products, 7),
      fallbackCopy:
        "Couture seamwork and luminous finish designed for black-tie entrances.",
      cta: "Shop Gown",
    },
  ]

  return (
    /* Exact 16px FWRD White Frame (`p-4`) & 16px Stacked Section Gaps (`space-y-4`) */
    <div className="bg-[#FFFFFF] text-[#0A0A0A] w-full p-4 space-y-4">
      {/* =====================================================================
          SECTION 1 — FULL-BLEED EDITORIAL HERO (Inside 16px White Frame)
      ====================================================================== */}
      <section className="w-full">
        <FullBleedEditorialPanel
          href={getProductHref(p0)}
          imageSrc={getSlotImage(products, 0)}
          imageAlt={getCleanTitle(p0, "ILLUSION — Collection I Nocturne")}
          kicker="COLLECTION I — NOCTURNE"
          title={heroOverlay.title}
          subtitle={heroOverlay.subtitle}
          ctaLabel="Shop the Gown"
          position={heroOverlay.position}
          isHero
          priority
        />
      </section>

      {/* =====================================================================
          SECTION 2 — DOUBLE BLOCK #1: FWRD ASYMMETRIC 50/50 CHECKERBOARD
          Left: Full-Bleed Safe-Zone Editorial | Right: #F5F5F5 Framed Gallery Mat
      ====================================================================== */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-0">
        {/* Left Column: Full-Bleed Dark Editorial (Product #1) */}
        <FullBleedEditorialPanel
          href={getProductHref(p1)}
          imageSrc={getSlotImage(products, 1)}
          imageAlt={getCleanTitle(p1, "ILLUSION Atelier Spotlight")}
          kicker="ATELIER SPOTLIGHT"
          title={spotlightOverlay.title}
          subtitle={spotlightOverlay.subtitle}
          ctaLabel="Shop the Gown"
          position={spotlightOverlay.position}
        />

        {/* Right Column: FWRD #F5F5F5 Light-Grey Gallery Mat (Product #2) */}
        <div className="bg-[#F5F5F5] px-8 py-12 md:px-16 lg:px-24 flex flex-col items-center justify-center">
          <LocalizedClientLink
            href={getProductHref(p2)}
            className="group block w-full max-w-[420px]"
          >
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-white">
              <Image
                src={p2Images[0]}
                alt={getCleanTitle(p2, "ILLUSION Evening Gown")}
                fill
                quality={88}
                sizes="(max-width: 1024px) 85vw, 420px"
                className="object-cover object-top"
              />
              {p2Images[1] && p2Images[1] !== p2Images[0] && (
                <Image
                  src={p2Images[1]}
                  alt={`${getCleanTitle(p2, "ILLUSION")} — Alternate View`}
                  fill
                  quality={88}
                  sizes="(max-width: 1024px) 85vw, 420px"
                  className="object-cover object-top opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                />
              )}
            </div>

            <div className="mt-7 text-center max-w-sm mx-auto">
              <h2
                style={{ fontFamily: "var(--font-editorial)" }}
                className="text-lg sm:text-xl font-medium uppercase tracking-[0.05em] leading-[1.15] text-[#0A0A0A]"
              >
                {getCleanTitle(p2, "THE EVENING EDIT")}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#0A0A0A]/65 line-clamp-2">
                {getCleanCaption(
                  p2,
                  "Pure architectural lines cut to command attention from every angle."
                )}
              </p>
              <span className="mt-4 inline-block text-[11px] uppercase tracking-[0.16em] font-medium text-[#0A0A0A] underline underline-offset-[5px] group-hover:opacity-65 transition-opacity">
                Shop Now
              </span>
            </div>
          </LocalizedClientLink>
        </div>
      </section>

      {/* =====================================================================
          SECTION 3 — DOUBLE BLOCK #2: FLIPPED 50/50 CHECKERBOARD
          Left: #F5F5F5 Framed Gallery Mat | Right: Full-Bleed Safe-Zone Editorial
      ====================================================================== */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-0">
        {/* Left Column: FWRD #F5F5F5 Light-Grey Gallery Mat (Product #3) */}
        <div className="bg-[#F5F5F5] px-8 py-12 md:px-16 lg:px-24 flex flex-col items-center justify-center order-2 lg:order-1">
          <LocalizedClientLink
            href={getProductHref(p3)}
            className="group block w-full max-w-[420px]"
          >
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-white">
              <Image
                src={p3Images[0]}
                alt={getCleanTitle(p3, "ILLUSION Gown")}
                fill
                quality={88}
                sizes="(max-width: 1024px) 85vw, 420px"
                className="object-cover object-top"
              />
              {p3Images[1] && p3Images[1] !== p3Images[0] && (
                <Image
                  src={p3Images[1]}
                  alt={`${getCleanTitle(p3, "ILLUSION")} — Alternate View`}
                  fill
                  quality={88}
                  sizes="(max-width: 1024px) 85vw, 420px"
                  className="object-cover object-top opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                />
              )}
            </div>

            <div className="mt-7 text-center max-w-sm mx-auto">
              <h2
                style={{ fontFamily: "var(--font-editorial)" }}
                className="text-lg sm:text-xl font-medium uppercase tracking-[0.05em] leading-[1.15] text-[#0A0A0A]"
              >
                {getCleanTitle(p3, "MODERN COUTURE")}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#0A0A0A]/65 line-clamp-2">
                {getCleanCaption(
                  p3,
                  "Refined drapery and couture hand-finishing conceived in our Dubai atelier."
                )}
              </p>
              <span className="mt-4 inline-block text-[11px] uppercase tracking-[0.16em] font-medium text-[#0A0A0A] underline underline-offset-[5px] group-hover:opacity-65 transition-opacity">
                Shop Now
              </span>
            </div>
          </LocalizedClientLink>
        </div>

        {/* Right Column: Full-Bleed Safe-Zone Editorial (Product #4) */}
        <FullBleedEditorialPanel
          href={getProductHref(p4)}
          imageSrc={getSlotImage(products, 4)}
          imageAlt={getCleanTitle(p4, "ILLUSION Made-to-Measure")}
          kicker="MADE-TO-MEASURE PRECISION"
          title={mtmOverlay.title}
          subtitle={mtmSubtitle}
          ctaLabel="Discover the Gown"
          position={mtmOverlay.position}
          className="order-1 lg:order-2"
        />
      </section>

      {/* =====================================================================
          SECTION 4 — NEW ARRIVALS: 4-UP PORTRAIT MERCHANDISING ROW
      ====================================================================== */}
      <section className="bg-[#FFFFFF] pt-10 pb-8 md:pt-14 md:pb-12">
        <div className="w-full">
          <div className="mb-7 md:mb-9 flex flex-col items-center justify-center relative">
            <h2 className="text-[13px] font-medium uppercase tracking-[0.18em] text-[#0A0A0A]">
              NEW ARRIVALS
            </h2>
            <LocalizedClientLink
              href="/store?sortBy=created_at&filter=new-arrivals"
              className="mt-2 md:mt-0 md:absolute md:right-0 text-[11px] uppercase tracking-[0.14em] text-[#0A0A0A] underline underline-offset-4 hover:opacity-65 transition-opacity"
            >
              View All
            </LocalizedClientLink>
          </div>

          {newArrivalProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {newArrivalProducts.map((product, idx) => (
                <div key={`new-arrival-${product.id}-${idx}`}>
                  <ProductPreview product={product} region={region} isFeatured />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 bg-[#F5F5F5] text-center px-6">
              <p className="text-xs uppercase tracking-[0.16em] text-[#0A0A0A]/65">
                New Season Collection Arriving Shortly
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          SECTION 5 — TRIPLE MAGAZINE STRIP (3-UP PORTRAIT EDITORIAL)
      ====================================================================== */}
      <section className="bg-[#F5F5F5] px-4 py-12 md:px-8 md:py-16">
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-4">
            {tripleStripItems.map((entry, idx) => {
              const itemTitle = getCleanTitle(
                entry.product,
                `LOOK 0${idx + 1}`
              )
              return (
                <LocalizedClientLink
                  key={`triple-${entry.product?.id || idx}-${idx}`}
                  href={getProductHref(entry.product)}
                  className="group flex flex-col"
                >
                  <div className="relative w-full aspect-[4/5] overflow-hidden bg-white">
                    <Image
                      src={entry.image}
                      alt={itemTitle}
                      fill
                      quality={86}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-top transition-transform duration-500 ease-luxury group-hover:scale-[1.02]"
                    />
                  </div>

                  <div className="pt-5 text-center px-2">
                    <h3
                      style={{ fontFamily: "var(--font-editorial)" }}
                      className="text-[12px] md:text-[13px] font-semibold uppercase tracking-[0.08em] text-[#0A0A0A]"
                    >
                      {itemTitle}
                    </h3>
                    <p className="mt-2 text-xs text-[#0A0A0A]/65 leading-relaxed max-w-xs mx-auto line-clamp-2">
                      {getCleanCaption(entry.product, entry.fallbackCopy)}
                    </p>
                    <span className="mt-3.5 inline-block text-[11px] uppercase tracking-[0.14em] font-medium text-[#0A0A0A] underline underline-offset-4 group-hover:opacity-65 transition-opacity">
                      {entry.cta}
                    </span>
                  </div>
                </LocalizedClientLink>
              )
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 6 — FULL-WIDTH 50/50 SEAMLESS DIPTYCH BANNER (CENTER-SEAM)
      ====================================================================== */}
      <section className="relative w-full bg-[#0A0A0A] overflow-hidden">
        <LocalizedClientLink
          href={getProductHref(diptychProduct)}
          className="group block relative w-full"
          aria-label={
            diptychCleanTitle
              ? `Explore ${diptychCleanTitle}`
              : "Explore Evening Archive"
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[76vh] overflow-hidden">
              <Image
                src={diptychLeftImg}
                alt={
                  diptychCleanTitle
                    ? `${diptychCleanTitle} — View I`
                    : "ILLUSION Evening Archive I"
                }
                fill
                quality={88}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top transition-transform duration-700 ease-luxury group-hover:scale-[1.015]"
              />
            </div>

            <div className="relative hidden md:block md:min-h-[76vh] overflow-hidden">
              <Image
                src={diptychRightImg}
                alt={
                  diptychCleanTitle
                    ? `${diptychCleanTitle} — View II`
                    : "ILLUSION Evening Archive II"
                }
                fill
                quality={88}
                sizes="50vw"
                className="object-cover object-top transition-transform duration-700 ease-luxury group-hover:scale-[1.015]"
              />
            </div>
          </div>

          {/* Subtle center-seam legibility veil */}
          <div className="absolute inset-0 bg-black/35 group-hover:bg-black/40 transition-colors duration-300" />

          {/* Dead-Center Typography Spanning the Seam */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
            <IllusionLogo height={34} />
            <h2
              style={{ fontFamily: "var(--font-editorial)" }}
              className="mt-4 text-2xl sm:text-3xl lg:text-[40px] leading-[1.08] font-medium uppercase tracking-[0.07em] text-white"
            >
              EVENING ARCHIVE
            </h2>
            <p className="mt-2.5 text-xs sm:text-[13px] text-white/85 max-w-md">
              {diptychCleanTitle
                ? `Featuring ${diptychCleanTitle} — tailored to order in Dubai.`
                : "Sculptural silhouettes crafted for nocturnal entrances."}
            </p>
            <span className="mt-5 inline-block text-[11px] uppercase tracking-[0.18em] font-medium text-white underline underline-offset-[6px]">
              Explore the Gown
            </span>
          </div>
        </LocalizedClientLink>
      </section>

      {/* =====================================================================
          SECTION 7 — BEST SELLERS: 4-UP (OR 8-UP) PORTRAIT GRID
      ====================================================================== */}
      <section className="bg-[#FFFFFF] pt-10 pb-8 md:pt-14 md:pb-10">
        <div className="w-full">
          <div className="mb-7 md:mb-9 flex flex-col items-center justify-center relative">
            <h2 className="text-[13px] font-medium uppercase tracking-[0.18em] text-[#0A0A0A]">
              BEST SELLERS
            </h2>
            <LocalizedClientLink
              href="/store"
              className="mt-2 md:mt-0 md:absolute md:right-0 text-[11px] uppercase tracking-[0.14em] text-[#0A0A0A] underline underline-offset-4 hover:opacity-65 transition-opacity"
            >
              Shop All
            </LocalizedClientLink>
          </div>

          {bestSellerProducts.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 gap-y-8 md:gap-y-10">
              {bestSellerProducts.map((product, idx) => (
                <div key={`best-seller-${product.id}-${idx}`}>
                  <ProductPreview product={product} region={region} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
