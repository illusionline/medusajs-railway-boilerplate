import { Metadata } from "next"
import Image from "next/image"

import IllusionLogo from "@components/brand/illusion-logo"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
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

/**
 * Distributes distinct products across homepage editorial slots and wraps safely
 * (`products[index % products.length]`) when fewer than 12 products are synced.
 */
function pickProduct(
  products: HttpTypes.StoreProduct[],
  index: number
): HttpTypes.StoreProduct | null {
  if (!products || products.length === 0) {
    return null
  }
  const safeIndex = ((index % products.length) + products.length) % products.length
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

function getEditorialCaption(
  product: HttpTypes.StoreProduct | null,
  fallback: string
): string {
  const raw = (product?.subtitle || product?.description || "").trim()
  if (!raw) return fallback

  const cleaned = raw
    .replace(/^[•\-*]\s*/gm, "")
    .replace(/\s+/g, " ")
    .trim()

  if (!cleaned) return fallback
  if (cleaned.length <= 135) return cleaned
  return `${cleaned.slice(0, 132).replace(/[,\s;:.]+$/, "")}...`
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
    <div className="bg-white text-[#0A0A0A] w-full">
      {/* =====================================================================
          SECTION 1 — EDGE-TO-EDGE FULL-BLEED HERO (100vw, 86vh desktop / 78vh mobile)
      ====================================================================== */}
      <section className="relative w-full h-[78vh] lg:h-[86vh] min-h-[540px] bg-[#0A0A0A] overflow-hidden">
        <LocalizedClientLink
          href={getProductHref(p0)}
          className="group block relative w-full h-full"
          aria-label={p0?.title ? `Shop ${p0.title}` : "Shop ILLUSIONLINE"}
        >
          <Image
            src={getSlotImage(products, 0)}
            alt={p0?.title || "ILLUSIONLINE — Collection I Nocturne"}
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover object-top md:object-center transition-transform duration-700 ease-luxury group-hover:scale-[1.015]"
          />

          {/* Subtle legibility scrims */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />

          <div className="absolute inset-0 flex items-end">
            <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 pb-12 md:pb-16">
              <div className="max-w-2xl text-white">
                <span className="block text-[11px] uppercase tracking-[0.2em] text-white/85 mb-3">
                  COLLECTION I — NOCTURNE
                </span>
                <h1
                  style={{ fontFamily: "var(--font-editorial)" }}
                  className="text-[32px] sm:text-[42px] lg:text-[52px] leading-[1.05] font-medium uppercase tracking-[0.06em] text-white"
                >
                  {p0?.title || "ARCHITECTURAL EVENINGWEAR"}
                </h1>
                <p className="mt-3 text-xs sm:text-[13px] text-white/85 tracking-[0.03em] max-w-lg">
                  Crafted in standard atelier sizing and bespoke made-to-measure
                  commissions.
                </p>
                <span className="mt-6 inline-block text-[11px] uppercase tracking-[0.18em] font-medium text-white underline underline-offset-[6px] decoration-white/80 group-hover:decoration-white">
                  Shop the Gown
                </span>
              </div>
            </div>
          </div>
        </LocalizedClientLink>
      </section>

      {/* =====================================================================
          SECTION 2 — DOUBLE BLOCK #1: FWRD ASYMMETRIC 50/50 CHECKERBOARD
          Left: Full-Bleed Dark Editorial | Right: Framed White Gallery Mat
      ====================================================================== */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-0 border-t border-[#E5E5E5]">
        {/* Left Column: Full-Bleed Dark Editorial (Product #1) */}
        <LocalizedClientLink
          href={getProductHref(p1)}
          className="group relative block w-full min-h-[620px] lg:min-h-[780px] overflow-hidden bg-[#0A0A0A]"
        >
          <Image
            src={getSlotImage(products, 1)}
            alt={p1?.title || "ILLUSIONLINE Atelier Spotlight"}
            fill
            quality={88}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-top transition-transform duration-700 ease-luxury group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/15 to-black/35" />

          <div className="relative z-10 p-8 sm:p-12 lg:p-14 max-w-lg text-white">
            <span className="block text-[11px] uppercase tracking-[0.2em] text-white/85">
              ATELIER SPOTLIGHT
            </span>
            <h2
              style={{ fontFamily: "var(--font-editorial)" }}
              className="mt-2.5 text-2xl sm:text-3xl lg:text-[34px] leading-[1.1] font-medium uppercase tracking-[0.06em] text-white"
            >
              {p1?.title || "SCULPTED CORSETRY"}
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-white/80 line-clamp-2 max-w-sm">
              {getEditorialCaption(
                p1,
                "Engineered with internal boning and liquid evening drape for an unmistakable silhouette."
              )}
            </p>
            <span className="mt-5 inline-block text-[11px] uppercase tracking-[0.16em] font-medium text-white underline underline-offset-[6px]">
              Shop the Gown
            </span>
          </div>
        </LocalizedClientLink>

        {/* Right Column: Framed Gallery Mat (Product #2) */}
        <div className="bg-[#F7F7F5] px-8 py-12 md:px-16 lg:px-24 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-[#E5E5E5]">
          <LocalizedClientLink
            href={getProductHref(p2)}
            className="group block w-full max-w-[430px]"
          >
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-white border border-[#E5E5E5]">
              <Image
                src={p2Images[0]}
                alt={p2?.title || "ILLUSIONLINE Evening Gown"}
                fill
                quality={88}
                sizes="(max-width: 1024px) 85vw, 430px"
                className="object-cover object-top"
              />
              {p2Images[1] && p2Images[1] !== p2Images[0] && (
                <Image
                  src={p2Images[1]}
                  alt={`${p2?.title || "ILLUSIONLINE"} — Alternate View`}
                  fill
                  quality={88}
                  sizes="(max-width: 1024px) 85vw, 430px"
                  className="object-cover object-top opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                />
              )}
            </div>

            <div className="mt-7 text-center max-w-sm mx-auto">
              <h2
                style={{ fontFamily: "var(--font-editorial)" }}
                className="text-lg sm:text-xl font-medium uppercase tracking-[0.06em] text-[#0A0A0A]"
              >
                {p2?.title || "THE EVENING EDIT"}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#0A0A0A]/65 line-clamp-2">
                {getEditorialCaption(
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
          Left: Framed White Gallery Mat | Right: Full-Bleed Editorial
      ====================================================================== */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-0 border-t border-[#E5E5E5]">
        {/* Left Column: Framed White Gallery Mat (Product #3) */}
        <div className="bg-white px-8 py-12 md:px-16 lg:px-24 flex flex-col items-center justify-center order-2 lg:order-1 border-t lg:border-t-0 border-[#E5E5E5]">
          <LocalizedClientLink
            href={getProductHref(p3)}
            className="group block w-full max-w-[430px]"
          >
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#F7F7F5] border border-[#E5E5E5]">
              <Image
                src={p3Images[0]}
                alt={p3?.title || "ILLUSIONLINE Gown"}
                fill
                quality={88}
                sizes="(max-width: 1024px) 85vw, 430px"
                className="object-cover object-top"
              />
              {p3Images[1] && p3Images[1] !== p3Images[0] && (
                <Image
                  src={p3Images[1]}
                  alt={`${p3?.title || "ILLUSIONLINE"} — Alternate View`}
                  fill
                  quality={88}
                  sizes="(max-width: 1024px) 85vw, 430px"
                  className="object-cover object-top opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                />
              )}
            </div>

            <div className="mt-7 text-center max-w-sm mx-auto">
              <h2
                style={{ fontFamily: "var(--font-editorial)" }}
                className="text-lg sm:text-xl font-medium uppercase tracking-[0.06em] text-[#0A0A0A]"
              >
                {p3?.title || "MODERN COUTURE"}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#0A0A0A]/65 line-clamp-2">
                {getEditorialCaption(
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

        {/* Right Column: Full-Bleed Editorial (Product #4) */}
        <LocalizedClientLink
          href={getProductHref(p4)}
          className="group relative block w-full min-h-[620px] lg:min-h-[780px] overflow-hidden bg-[#0A0A0A] order-1 lg:order-2 lg:border-l border-[#E5E5E5]"
        >
          <Image
            src={getSlotImage(products, 4)}
            alt={p4?.title || "ILLUSIONLINE Made-to-Measure"}
            fill
            quality={88}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-top transition-transform duration-700 ease-luxury group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/15 to-black/35" />

          <div className="relative z-10 p-8 sm:p-12 lg:p-14 max-w-lg text-white">
            <span className="block text-[11px] uppercase tracking-[0.2em] text-white/85">
              MADE-TO-MEASURE PRECISION
            </span>
            <h2
              style={{ fontFamily: "var(--font-editorial)" }}
              className="mt-2.5 text-2xl sm:text-3xl lg:text-[34px] leading-[1.1] font-medium uppercase tracking-[0.06em] text-white"
            >
              {p4?.title || "BESPOKE PROPORTIONS"}
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-white/85 max-w-sm">
              Tailored in our atelier to your exact proportions or standard
              sizing.
            </p>
            <span className="mt-5 inline-block text-[11px] uppercase tracking-[0.16em] font-medium text-white underline underline-offset-[6px]">
              Discover the Gown
            </span>
          </div>
        </LocalizedClientLink>
      </section>

      {/* =====================================================================
          SECTION 4 — NEW ARRIVALS: 4-UP PORTRAIT MERCHANDISING ROW
      ====================================================================== */}
      <section className="border-t border-[#E5E5E5] bg-white py-16 md:py-24">
        <div className="max-w-[1680px] mx-auto">
          <div className="px-4 md:px-8 mb-8 md:mb-10 flex flex-col items-center justify-center relative">
            <h2 className="text-[13px] font-medium uppercase tracking-[0.18em] text-[#0A0A0A]">
              NEW ARRIVALS
            </h2>
            <LocalizedClientLink
              href="/store?sortBy=created_at&filter=new-arrivals"
              className="mt-2 md:mt-0 md:absolute md:right-8 text-[11px] uppercase tracking-[0.14em] text-[#0A0A0A] underline underline-offset-4 hover:opacity-65 transition-opacity"
            >
              View All
            </LocalizedClientLink>
          </div>

          {newArrivalProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 px-4 md:px-8">
              {newArrivalProducts.map((product, idx) => (
                <div key={`new-arrival-${product.id}-${idx}`}>
                  <ProductPreview product={product} region={region} isFeatured />
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-4 md:mx-8 py-16 border border-[#E5E5E5] bg-[#F7F7F5] text-center px-6">
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
      <section className="border-t border-[#E5E5E5] bg-[#F7F7F5] py-16 md:py-24">
        <div className="max-w-[1680px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-4">
            {tripleStripItems.map((entry, idx) => (
              <LocalizedClientLink
                key={`triple-${entry.product?.id || idx}-${idx}`}
                href={getProductHref(entry.product)}
                className="group flex flex-col"
              >
                <div className="relative w-full aspect-[4/5] overflow-hidden bg-white border border-[#E5E5E5]">
                  <Image
                    src={entry.image}
                    alt={entry.product?.title || "ILLUSIONLINE Editorial"}
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
                    {entry.product?.title || `LOOK 0${idx + 1}`}
                  </h3>
                  <p className="mt-2 text-xs text-[#0A0A0A]/65 leading-relaxed max-w-xs mx-auto line-clamp-2">
                    {getEditorialCaption(entry.product, entry.fallbackCopy)}
                  </p>
                  <span className="mt-3.5 inline-block text-[11px] uppercase tracking-[0.14em] font-medium text-[#0A0A0A] underline underline-offset-4 group-hover:opacity-65 transition-opacity">
                    {entry.cta}
                  </span>
                </div>
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 6 — FULL-WIDTH 50/50 SEAMLESS DIPTYCH BANNER (CENTER-SEAM)
      ====================================================================== */}
      <section className="relative w-full border-t border-[#E5E5E5] bg-[#0A0A0A] overflow-hidden">
        <LocalizedClientLink
          href={getProductHref(diptychProduct)}
          className="group block relative w-full"
          aria-label={
            diptychProduct?.title
              ? `Explore ${diptychProduct.title}`
              : "Explore Evening Archive"
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[76vh] overflow-hidden">
              <Image
                src={diptychLeftImg}
                alt={
                  diptychProduct?.title
                    ? `${diptychProduct.title} — View I`
                    : "ILLUSIONLINE Evening Archive I"
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
                  diptychProduct?.title
                    ? `${diptychProduct.title} — View II`
                    : "ILLUSIONLINE Evening Archive II"
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
              className="mt-4 text-3xl sm:text-4xl lg:text-[48px] leading-[1.06] font-medium uppercase tracking-[0.08em] text-white"
            >
              EVENING ARCHIVE
            </h2>
            <p className="mt-2.5 text-xs sm:text-[13px] text-white/85 max-w-md">
              {diptychProduct?.title
                ? `Featuring ${diptychProduct.title} — tailored to order in Dubai.`
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
      <section className="border-t border-[#E5E5E5] bg-white py-16 md:py-24">
        <div className="max-w-[1680px] mx-auto">
          <div className="px-4 md:px-8 mb-8 md:mb-10 flex flex-col items-center justify-center relative">
            <h2 className="text-[13px] font-medium uppercase tracking-[0.18em] text-[#0A0A0A]">
              BEST SELLERS
            </h2>
            <LocalizedClientLink
              href="/store"
              className="mt-2 md:mt-0 md:absolute md:right-8 text-[11px] uppercase tracking-[0.14em] text-[#0A0A0A] underline underline-offset-4 hover:opacity-65 transition-opacity"
            >
              Shop All
            </LocalizedClientLink>
          </div>

          {bestSellerProducts.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 gap-y-8 md:gap-y-10 px-4 md:px-8">
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
