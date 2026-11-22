import React, { Suspense } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

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
    <div className="bg-[#FAF9F6] text-[#0A0A0A]">
      {/* 2-Column Bespoke Luxury Product Layout */}
      <div
        className="w-full max-w-[1680px] mx-auto grid grid-cols-1 small:grid-cols-[58%_42%] large:grid-cols-[60%_40%] items-start border-b border-[#0A0A0A]/10"
        data-testid="product-container"
      >
        {/* Left Column: Edge-to-Edge Vertical Stack of Full-Bleed 4:5 Editorial Photos */}
        <div className="w-full border-b small:border-b-0 small:border-r border-[#0A0A0A]/10">
          <ImageGallery images={images} productTitle={product.title} />
        </div>

        {/* Right Sticky Column: Title, Price, Editorial Copy, Sizing Toggle & Bespoke Inputs */}
        <div className="w-full small:sticky small:top-20 px-6 py-10 small:px-10 medium:px-14 large:px-16 small:py-14 flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-3">
            <div className="flex items-center gap-x-2 text-[10px] uppercase tracking-[0.26em] text-[#0A0A0A]/50">
              <LocalizedClientLink
                href="/store"
                className="hover:text-[#0A0A0A] transition-colors"
              >
                Eveningwear
              </LocalizedClientLink>
              {product.collection && (
                <>
                  <span>/</span>
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
              className="font-display text-3xl small:text-4xl large:text-[42px] font-light leading-[1.12] tracking-wide text-[#0A0A0A]"
              data-testid="product-title"
            >
              {product.title}
            </h1>
          </div>

          <ProductActions product={product} region={region} />

          <ProductTabs product={product} />
        </div>
      </div>

      {/* Complementary Silhouettes */}
      <div
        className="content-container py-20 small:py-28"
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
