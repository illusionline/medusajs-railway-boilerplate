import { Heading } from "@medusajs/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"

const CheckoutSummary = ({ cart }: { cart: any }) => {
  return (
    <div className="sticky top-24 flex flex-col-reverse small:flex-col gap-y-8 py-8 small:py-0">
      <div className="w-full bg-[#FAF9F6] border border-[#0A0A0A]/10 p-6 small:p-8 flex flex-col">
        <Divider className="my-6 small:hidden" />
        <Heading
          level="h2"
          className="font-display text-2xl small:text-3xl font-light tracking-wide text-[#0A0A0A]"
        >
          Your Selection
        </Heading>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#0A0A0A]/55 mt-1">
          Worldwide DHL Express · Atelier Insured
        </p>
        <Divider className="my-6" />
        <ItemsPreviewTemplate cart={cart} />
        <Divider className="my-6" />
        <CartTotals totals={cart} />
        <div className="mt-6">
          <DiscountCode cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
