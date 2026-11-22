import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

const LineItemOptions = ({
  variant,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  if (!variant?.title || variant.title.toLowerCase() === "default variant") {
    return null
  }

  return (
    <Text
      data-testid={dataTestid}
      data-value={dataValue}
      className="inline-block text-xs tracking-[0.08em] uppercase text-[#0A0A0A]/60 w-full overflow-hidden text-ellipsis"
    >
      Size: {variant.title}
    </Text>
  )
}

export default LineItemOptions
