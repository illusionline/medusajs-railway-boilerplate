import React, { Suspense } from "react"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <div className="bg-white text-[#0A0A0A]">
      {/* 2-Column Bespoke Luxury Product Layout */}
      <div
        className="w-full max-w-[1680px] mx-auto grid grid-cols-1 small:grid-cols-[58%_42%] large:grid-cols-[60%_40%] items-start border-b border-[#E5E5E5]"
        data-testid="product-container"
      >
        {/* Left Column: Edge-to-Edge Vertical Stack of Full-Bleed 4:5 Editorial Photos */}
        <div className="w-full border-b small:border-b-0 small:border-r border-[#E5E5E5]">
          <ImageGallery images={images} productTitle={product.title} />
        </div>

        {/* Right Sticky Column: Title, Price, Editorial Copy, Sizing Toggle & Bespoke Inputs */}
        <div className="w-full small:sticky small:top-[136px] px-5 py-10 small:px-10 medium:px-14 large:px-16 small:py-12 flex flex-col gap-y-6 bg-white">
          <div className="flex flex-col gap-y-2.5">
            <div className="flex items-center gap-x-2 text-[11px] uppercase tracking-[0.14em] text-[#0A0A0A]/55">
              <LocalizedClientLink
                href="/store"
                className="hover:text-[#0A0A0A] transition-colors"
              >
                All Dresses
              </LocalizedClientLink>
              {product.collection && (
                <>
                  <span className="text-[#0A0A0A]/30">/</span>
                  <LocalizedClientLink
                    href={`/collections/${product.collection.handle}`}
                    className="hover:text-[#0A0A0A] transition-colors"
                  >
                    {product.collection.title}
                  </LocalizedClientLink>
                </>
              )}
            </div>

            <h1
              style={{ fontFamily: "var(--font-editorial)" }}
              className="text-2xl small:text-3xl large:text-[32px] font-medium uppercase leading-[1.14] tracking-[0.06em] text-[#0A0A0A]"
              data-testid="product-title"
            >
              {product.title}
            </h1>
          </div>

          <ProductActions product={product} region={region} />

          <ProductTabs product={product} />
        </div>
      </div>

      {/* Dual 4-Column 4:5 Portrait Cross-Sell Merchandising Rows */}
      <div
        className="max-w-[1680px] mx-auto px-4 md:px-8 py-16 md:py-24"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  )
}

export default ProductTemplate
