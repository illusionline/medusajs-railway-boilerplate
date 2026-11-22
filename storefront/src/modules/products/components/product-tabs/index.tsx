"use client"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Composition & Atelier Details",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Worldwide DHL Express & Bespoke Care",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full border-t border-[#0A0A0A]/10 pt-2">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-xs text-[#0A0A0A]/75 py-5 space-y-4 leading-relaxed">
      <p>
        Hand-finished in the ILLUSIONLINE atelier with architectural seam
        construction and luxury eveningwear lining.
      </p>
      <div className="grid grid-cols-2 gap-4 pt-1">
        <div>
          <span className="block text-[10px] uppercase tracking-[0.2em] text-[#0A0A0A]/45 mb-1">
            Material
          </span>
          <p className="text-[#0A0A0A]">
            {product.material ? product.material : "Couture Silk-Crepe Blend"}
          </p>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-[0.2em] text-[#0A0A0A]/45 mb-1">
            Origin
          </span>
          <p className="text-[#0A0A0A]">
            {product.origin_country
              ? product.origin_country.toUpperCase()
              : "ILLUSIONLINE Atelier"}
          </p>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-xs text-[#0A0A0A]/75 py-5 space-y-3 leading-relaxed">
      <p>
        <strong className="font-medium text-[#0A0A0A]">
          Worldwide DHL Express:
        </strong>{" "}
        Insured door-to-door delivery in 1–2 business days within the UAE &amp;
        GCC, and 2–5 business days internationally.
      </p>
      <p>
        <strong className="font-medium text-[#0A0A0A]">
          Made-to-Measure Commissions:
        </strong>{" "}
        Individually drafted to your submitted measurements within 10–14
        business days, with complimentary minor tailoring adjustments included.
      </p>
    </div>
  )
}

export default ProductTabs
