"use client"

import { HttpTypes } from "@medusajs/types"
import { Heading, clx } from "@medusajs/ui"
import SettlementAndDutiesBanner from "@modules/checkout/components/settlement-and-duties-banner"
import { useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import PaymentButton from "../payment-button"

const BESPOKE_KEYWORDS = [
  "custom",
  "made-to-measure",
  "made to measure",
  "bespoke",
  "mtm",
]

function isCustomText(val?: string | null): boolean {
  if (!val) return false
  const lower = val.trim().toLowerCase()
  return BESPOKE_KEYWORDS.some((kw) => lower === kw || lower.includes(kw))
}

export function cartHasBespokeItems(cart?: HttpTypes.StoreCart | null): boolean {
  if (!cart?.items?.length) return false

  return cart.items.some((item: any) => {
    if (
      isCustomText(item.variant?.title) ||
      isCustomText(item.variant_title) ||
      item.variant?.options?.some((opt: any) => isCustomText(opt?.value))
    ) {
      return true
    }

    const meta = item.metadata as Record<string, unknown> | undefined
    if (!meta || typeof meta !== "object") return false

    if (meta.sizing_mode === "Made-to-Measure") return true

    return Boolean(
      (typeof meta.bust === "string" && meta.bust.trim()) ||
        (typeof meta.waist === "string" && meta.waist.trim()) ||
        (typeof meta.hips === "string" && meta.hips.trim()) ||
        (typeof meta.hollow_to_hem === "string" &&
          meta.hollow_to_hem.trim()) ||
        (typeof meta.height === "string" && meta.height.trim())
    )
  })
}

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()

  // Mandatory unchecked-by-default chargeback-defense confirmation states
  const [generalConfirmed, setGeneralConfirmed] = useState(false)
  const [bespokeConfirmed, setBespokeConfirmed] = useState(false)

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart?.shipping_address &&
    cart?.shipping_methods?.length > 0 &&
    (cart?.payment_collection || paidByGiftcard)

  const hasBespoke = useMemo(() => cartHasBespokeItems(cart), [cart])

  const allPoliciesAccepted =
    generalConfirmed && (!hasBespoke || bespokeConfirmed)

  return (
    <div className="bg-transparent">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row font-display text-3xl font-light tracking-wide text-[#0A0A0A] gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          Review &amp; Confirm
        </Heading>
      </div>

      {isOpen && previousStepsCompleted && (
        <div className="space-y-6">
          {/* AED Settlement & Destination DHL Import Duties Disclosure */}
          <SettlementAndDutiesBanner cart={cart} />

          {/* Mandatory Unchecked-by-Default Confirmation Checkboxes */}
          <div
            className="border border-[#0A0A0A]/20 bg-[#FAF9F6] p-5 space-y-4"
            data-testid="checkout-policy-gate"
          >
            <span className="block text-[10px] uppercase tracking-[0.24em] text-[#0A0A0A]/55">
              Client Order Confirmation (Required)
            </span>

            {/* Checkbox 1: Always Required */}
            <label
              htmlFor="confirm-general-terms"
              className="flex items-start gap-x-3.5 cursor-pointer select-none group"
            >
              <input
                id="confirm-general-terms"
                type="checkbox"
                checked={generalConfirmed}
                onChange={(e) => setGeneralConfirmed(e.target.checked)}
                data-testid="confirm-general-terms-checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#0A0A0A] border border-[#0A0A0A]/40 rounded-none cursor-pointer"
              />
              <span className="text-xs leading-relaxed text-[#0A0A0A]/85 group-hover:text-[#0A0A0A] transition-colors">
                I confirm my size selection and delivery address, and agree to
                ILLUSIONLINE&apos;s return policy, production lead times,
                recipient responsibility for destination DHL import
                duties/taxes, and payment settlement in AED.
              </span>
            </label>

            {/* Checkbox 2: Conditionally Required when Bespoke / Custom Items Present */}
            {hasBespoke && (
              <label
                htmlFor="confirm-bespoke-terms"
                className="flex items-start gap-x-3.5 cursor-pointer select-none group pt-3 border-t border-[#0A0A0A]/10"
              >
                <input
                  id="confirm-bespoke-terms"
                  type="checkbox"
                  checked={bespokeConfirmed}
                  onChange={(e) => setBespokeConfirmed(e.target.checked)}
                  data-testid="confirm-bespoke-terms-checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#0A0A0A] border border-[#0A0A0A]/40 rounded-none cursor-pointer"
                />
                <span className="text-xs leading-relaxed text-[#0A0A0A]/85 group-hover:text-[#0A0A0A] transition-colors">
                  I confirm my submitted Made-to-Measure measurements are
                  accurate and understand bespoke-tailored gowns are crafted to
                  my specifications (complimentary minor adjustments included).
                </span>
              </label>
            )}
          </div>

          <PaymentButton
            cart={cart}
            policyAccepted={allPoliciesAccepted}
            bespokeConfirmed={hasBespoke ? bespokeConfirmed : false}
            data-testid="submit-order-button"
          />
        </div>
      )}
    </div>
  )
}

export default Review
