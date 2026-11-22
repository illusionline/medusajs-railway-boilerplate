import { getPercentageDiff } from "@lib/util/get-percentage-diff"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
}

const LineItemPrice = ({
  item,
  style = "default",
  currencyCode,
}: LineItemPriceProps) => {
  const { total, original_total } = item
  const originalPrice = original_total ?? 0
  const currentPrice = total ?? 0
  const hasReducedPrice = currentPrice < originalPrice

  return (
    <div className="flex flex-col gap-x-2 text-[#0A0A0A]/80 items-end">
      <div className="text-right">
        {hasReducedPrice && (
          <>
            <p>
              {style === "default" && (
                <span className="text-[#0A0A0A]/50">Original: </span>
              )}
              <span
                className="line-through text-[#0A0A0A]/45 text-xs"
                data-testid="product-original-price"
              >
                {convertToLocale({
                  amount: originalPrice,
                  currency_code: currencyCode,
                })}
              </span>
            </p>
            {style === "default" && (
              <span className="text-xs text-[#0A0A0A]">
                -{getPercentageDiff(originalPrice, currentPrice)}%
              </span>
            )}
          </>
        )}
        <span
          className={clx("text-xs tracking-[0.06em] text-[#0A0A0A]", {
            "font-medium": hasReducedPrice,
          })}
          data-testid="product-price"
        >
          {convertToLocale({
            amount: currentPrice,
            currency_code: currencyCode,
          })}
        </span>
      </div>
    </div>
  )
}

export default LineItemPrice
