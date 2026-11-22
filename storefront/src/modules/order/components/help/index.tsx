import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

const Help = () => {
  return (
    <div className="mt-6">
      <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#0A0A0A]">
        Atelier Concierge
      </h3>
      <div className="text-xs text-[#0A0A0A]/70 my-3">
        <ul className="gap-y-2 flex flex-col">
          <li>
            <LocalizedClientLink
              href="/client-care#concierge"
              className="hover:text-[#0A0A0A] underline underline-offset-4"
            >
              Client Concierge
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink
              href="/client-care#shipping"
              className="hover:text-[#0A0A0A] underline underline-offset-4"
            >
              Worldwide DHL Express Shipping
            </LocalizedClientLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
