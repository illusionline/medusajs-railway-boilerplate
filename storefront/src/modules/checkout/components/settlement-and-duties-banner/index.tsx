"use client"

import { useDisplayCurrency } from "@lib/context/display-currency-context"
import { HttpTypes } from "@medusajs/types"
import React from "react"

type SettlementAndDutiesBannerProps = {
  cart: HttpTypes.StoreCart
}

const SettlementAndDutiesBanner: React.FC<SettlementAndDutiesBannerProps> = ({
  cart,
}) => {
  const { displayCurrency, formatAEDNumber } = useDisplayCurrency()

  const shippingCountry =
    cart?.shipping_address?.country_code?.trim().toLowerCase() || ""
  const isInternationalOutsideUAE =
    Boolean(shippingCountry) && shippingCountry !== "ae"
  const isAustralia = shippingCountry === "au"

  const exactAedTotal = formatAEDNumber(cart?.total ?? 0)

  if (displayCurrency === "AED" && !isInternationalOutsideUAE) {
    return null
  }

  return (
    <div
      className="flex flex-col gap-y-3 my-5"
      data-testid="settlement-and-duties-banners"
    >
      {/* Transparent AED Settlement Banner */}
      {displayCurrency !== "AED" && (
        <div
          className="border border-[#0A0A0A]/25 bg-[#F2EFE9]/75 px-4 py-3.5 text-xs leading-relaxed text-[#0A0A0A]"
          data-testid="aed-settlement-banner"
        >
          <span className="block text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/60 mb-1">
            Currency &amp; Settlement Notice
          </span>
          <p>
            Displayed <strong>{displayCurrency}</strong> amounts are approximate
            conversions. Your order will be charged in{" "}
            <strong>AED {exactAedTotal}</strong>, and your card-issuing bank
            will apply its own prevailing exchange rate.
          </p>
        </div>
      )}

      {/* International DHL Express Import Duty / Tax Notice */}
      {isInternationalOutsideUAE && (
        <div
          className="border border-[#0A0A0A]/20 bg-[#FAF9F6] px-4 py-3.5 text-xs leading-relaxed text-[#0A0A0A]/85 space-y-2"
          data-testid="international-duties-banner"
        >
          <span className="block text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/60">
            International DHL Express Customs &amp; Import Duties
          </span>
          <p>
            Orders shipping outside the United Arab Emirates are dispatched via{" "}
            <strong className="font-medium text-[#0A0A0A]">
              DHL Express Worldwide
            </strong>{" "}
            on a DDU/DAP basis. Destination import duties, local GST/VAT, and
            customs brokerage charges levied upon arrival are the sole
            responsibility of the recipient.
          </p>

          {isAustralia && (
            <div
              className="border-l-2 border-[#0A0A0A] pl-3 py-1 bg-[#F2EFE9]/60 text-[#0A0A0A]"
              data-testid="australia-customs-threshold-notice"
            >
              <strong className="font-medium">
                Australia Customs Notice (AUD $1,000 Threshold):
              </strong>{" "}
              Under Australian Border Force regulations, international shipments
              into Australia valued above <strong>AUD $1,000</strong> incur
              Australian import duties, 10% GST, and customs import processing
              charges payable directly by the recipient to DHL Express /
              Australian Border Force prior to delivery release.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SettlementAndDutiesBanner
