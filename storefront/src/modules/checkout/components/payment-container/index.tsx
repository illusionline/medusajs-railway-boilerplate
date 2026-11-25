import { Radio as RadioGroupOption } from "@headlessui/react"
import { Text, clx } from "@medusajs/ui"
import React, { useContext, useMemo, type JSX } from "react"

import Radio from "@modules/common/components/radio"

import { isManual } from "@lib/constants"
import SkeletonCardDetails from "@modules/skeletons/components/skeleton-card-details"
import { CardElement } from "@stripe/react-stripe-js"
import { StripeCardElementOptions } from "@stripe/stripe-js"
import PaymentTest from "../payment-test"
import { StripeContext } from "../payment-wrapper/stripe-wrapper"

type PaymentContainerProps = {
  paymentProviderId: string
  selectedPaymentOptionId: string | null
  disabled?: boolean
  paymentInfoMap: Record<
    string,
    { title: string; subtitle?: string; icon: JSX.Element }
  >
  children?: React.ReactNode
}

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  children,
}) => {
  const isDevelopment = process.env.NODE_ENV === "development"
  const isSelected = selectedPaymentOptionId === paymentProviderId
  const info = paymentInfoMap[paymentProviderId]

  return (
    <RadioGroupOption
      key={paymentProviderId}
      value={paymentProviderId}
      disabled={disabled}
      className={clx(
        "flex flex-col gap-y-2 text-small-regular cursor-pointer py-4 border px-6 mb-2.5 transition-colors duration-200",
        isSelected
          ? "border-[#0A0A0A] bg-[#F2EFE9]/50"
          : "border-[#0A0A0A]/15 bg-transparent hover:border-[#0A0A0A]/40"
      )}
    >
      <div className="flex items-start justify-between gap-x-4">
        <div className="flex items-start gap-x-4">
          <div className="mt-0.5">
            <Radio checked={isSelected} />
          </div>
          <div className="flex flex-col">
            <Text className="text-sm font-medium text-[#0A0A0A]">
              {info?.title || paymentProviderId}
            </Text>
            {info?.subtitle && (
              <span className="text-xs text-[#0A0A0A]/60 mt-0.5 leading-relaxed">
                {info.subtitle}
              </span>
            )}
          </div>
          {isManual(paymentProviderId) && isDevelopment && (
            <PaymentTest className="hidden small:block" />
          )}
        </div>
        <span className="justify-self-end text-[#0A0A0A] shrink-0 mt-0.5">
          {info?.icon}
        </span>
      </div>
      {isManual(paymentProviderId) && isDevelopment && (
        <PaymentTest className="small:hidden text-[10px]" />
      )}
      {children}
    </RadioGroupOption>
  )
}

export default PaymentContainer

export const StripeCardContainer = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  setCardBrand,
  setError,
  setCardComplete,
}: Omit<PaymentContainerProps, "children"> & {
  setCardBrand: (brand: string) => void
  setError: (error: string | null) => void
  setCardComplete: (complete: boolean) => void
}) => {
  const stripeReady = useContext(StripeContext)

  const useOptions: StripeCardElementOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: "Plus Jakarta Sans, Inter, sans-serif",
          color: "#0A0A0A",
          "::placeholder": {
            color: "rgba(10, 10, 10, 0.45)",
          },
        },
      },
      classes: {
        base: "pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-[#FAF9F6] border border-[#0A0A0A]/25 appearance-none focus:outline-none focus:ring-0 focus:border-[#0A0A0A] transition-colors duration-200",
      },
    }
  }, [])

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      {selectedPaymentOptionId === paymentProviderId &&
        (stripeReady ? (
          <div className="my-4 transition-all duration-150 ease-in-out">
            <Text className="text-xs uppercase tracking-[0.18em] text-[#0A0A0A]/70 mb-2">
              Enter Card Details
            </Text>
            <CardElement
              options={useOptions as StripeCardElementOptions}
              onChange={(e) => {
                setCardBrand(
                  e.brand && e.brand.charAt(0).toUpperCase() + e.brand.slice(1)
                )
                setError(e.error?.message || null)
                setCardComplete(e.complete)
              }}
            />
          </div>
        ) : (
          <SkeletonCardDetails />
        ))}
    </PaymentContainer>
  )
}
