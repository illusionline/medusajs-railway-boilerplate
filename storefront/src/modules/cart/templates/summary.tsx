"use client"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <div className="flex flex-col gap-y-5">
      <h2 className="font-display text-2xl small:text-3xl font-light tracking-wide text-[#0A0A0A]">
        Order Summary
      </h2>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
        className="w-full mt-2"
      >
        <button
          type="button"
          className="w-full h-12 bg-[#0A0A0A] text-[#FAF9F6] text-xs uppercase tracking-[0.24em] font-medium hover:bg-[#1A1A1A] transition-colors duration-300"
        >
          Proceed to Checkout
        </button>
      </LocalizedClientLink>
      <p className="text-[11px] text-[#0A0A0A]/55 text-center tracking-wide">
        Worldwide DHL Express · Complimentary Atelier Packaging
      </p>
    </div>
  )
}

export default Summary
