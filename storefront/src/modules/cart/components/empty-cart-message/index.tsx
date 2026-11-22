import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EmptyCartMessage = () => {
  return (
    <div
      className="py-36 px-2 flex flex-col justify-center items-center text-center"
      data-testid="empty-cart-message"
    >
      <span className="text-[11px] uppercase tracking-[0.28em] text-[#0A0A0A]/50 mb-3">
        ILLUSIONLINE ATELIER
      </span>
      <h1 className="font-display text-4xl small:text-5xl font-light tracking-wide text-[#0A0A0A]">
        Your Shopping Bag is Empty
      </h1>
      <p className="text-sm text-[#0A0A0A]/65 mt-4 mb-8 max-w-md leading-relaxed">
        Discover our architectural eveningwear silhouettes, available in
        ready-to-wear sizes and bespoke made-to-measure tailoring.
      </p>
      <LocalizedClientLink
        href="/store"
        className="px-8 py-3.5 bg-[#0A0A0A] text-[#FAF9F6] text-xs uppercase tracking-[0.24em] hover:bg-[#1A1A1A] transition-colors duration-300"
      >
        Explore Collection
      </LocalizedClientLink>
    </div>
  )
}

export default EmptyCartMessage
