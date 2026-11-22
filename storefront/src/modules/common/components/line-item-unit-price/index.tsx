import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type LineItemUnitPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
}

const LineItemUnitPrice = ({
  item,
  style = "default",
  currencyCode,
}: LineItemUnitPriceProps) => {
  const total = item.total ?? 0
  const originalTotal = item.original_total ?? 0
  const hasReducedPrice = total < originalTotal && originalTotal > 0

  const percentage_diff =
    originalTotal > 0
      ? Math.round(((originalTotal - total) / originalTotal) * 100)
      : 0

  return (
    <div className="flex flex-col text-[#0A0A0A]/65 justify-center h-full">
      {hasReducedPrice && (
        <>
          <p>
            {style === "default" && (
              <span className="text-[#0A0A0A]/50">Original: </span>
            )}
            <span
              className="line-through text-xs"
              data-testid="product-unit-original-price"
            >
              {convertToLocale({
                amount: originalTotal / item.quantity,
                currency_code: currencyCode,
              })}
            </span>
          </p>
          {style === "default" && (
            <span className="text-xs text-[#0A0A0A]">-{percentage_diff}%</span>
          )}
        </>
      )}
      <span
        className={clx("text-xs tracking-[0.04em]", {
          "font-medium text-[#0A0A0A]": hasReducedPrice,
        })}
        data-testid="product-unit-price"
      >
        {convertToLocale({
          amount: total / item.quantity,
          currency_code: currencyCode,
        })}
      </span>
    </div>
  )
}

export default LineItemUnitPrice
