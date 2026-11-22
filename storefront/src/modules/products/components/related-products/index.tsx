import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const queryParams: HttpTypes.StoreProductListParams = {
    limit: 5,
    is_giftcard: false,
  }
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }

  const products = await listProducts({
    queryParams,
    countryCode,
  })
    .then(({ response }) =>
      response.products
        .filter((responseProduct) => responseProduct.id !== product.id)
        .slice(0, 4)
    )
    .catch(() => [])

  if (!products.length) {
    return null
  }

  return (
    <div>
      <div className="flex flex-col items-start mb-12 pb-5 border-b border-[#0A0A0A]/10">
        <span className="text-[10px] uppercase tracking-[0.28em] text-[#0A0A0A]/45 mb-2">
          Curated Selection
        </span>
        <h2 className="font-display text-3xl small:text-4xl font-light tracking-wide text-[#0A0A0A]">
          Complementary Silhouettes
        </h2>
      </div>

      <ul className="grid grid-cols-2 small:grid-cols-4 gap-x-6 gap-y-12">
        {products.map((related) => (
          <li key={related.id}>
            <Product region={region} product={related} />
          </li>
        ))}
      </ul>
    </div>
  )
}
