"use client"

import { RadioGroup } from "@headlessui/react"
import { isNgenius, isStripeLike, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession } from "@lib/data/cart"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import { Button, Container, Heading, Text, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentContainer, {
  StripeCardContainer,
} from "@modules/checkout/components/payment-container"
import SettlementAndDutiesBanner from "@modules/checkout/components/settlement-and-duties-banner"
import Divider from "@modules/common/components/divider"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ??
      availablePaymentMethods?.find((m) => isNgenius(m.id))?.id ??
      ""
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"
  const paymentErrorCode = searchParams.get("payment_error")

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    if (isStripeLike(method)) {
      await initiatePaymentSession(cart, {
        provider_id: method,
      })
    }
  }

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && cart?.shipping_methods.length !== 0) || paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.delete("payment_error")
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const shouldInputCard =
        isStripeLike(selectedPaymentMethod) && !activeSession

      const checkActiveSession =
        activeSession?.provider_id === selectedPaymentMethod &&
        (!isNgenius(selectedPaymentMethod) ||
          Boolean(activeSession?.data?.paymentUrl))

      if (!checkActiveSession) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
          data: isNgenius(selectedPaymentMethod)
            ? {
                email: cart.email,
                billing_address: cart.billing_address,
              }
            : undefined,
        })
      }

      if (!shouldInputCard) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        )
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-transparent">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row font-display text-3xl font-light tracking-wide text-[#0A0A0A] gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !paymentReady,
            }
          )}
        >
          Payment
          {!isOpen && paymentReady && <CheckCircleSolid />}
        </Heading>
        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-xs uppercase tracking-[0.18em] text-[#0A0A0A]/70 hover:text-[#0A0A0A] underline underline-offset-4"
              data-testid="edit-payment-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {/* Luxury Alert Banner for N-Genius Cancelled / Declined Redirects */}
          {paymentErrorCode && (
            <div
              role="alert"
              data-testid="ngenius-payment-error-alert"
              className="mb-5 border-l-2 border-[#0A0A0A] bg-[#F2EFE9] px-4 py-3.5 text-xs leading-relaxed text-[#0A0A0A]"
            >
              <span className="block text-[10px] uppercase tracking-[0.22em] font-medium text-[#0A0A0A] mb-1">
                {paymentErrorCode === "cancelled"
                  ? "Payment Session Cancelled"
                  : "Payment Authorisation Unsuccessful"}
              </span>
              <p className="text-[#0A0A0A]/80">
                {paymentErrorCode === "cancelled"
                  ? "Your Network International (Card / Apple Pay) payment session was cancelled and your card was not charged. Your shopping bag remains intact — continue to review whenever you are ready."
                  : "Your payment could not be completed or was declined by your card-issuing bank. Your shopping bag and selections remain saved — please retry below or use an alternative card / Apple Pay."}
              </p>
            </div>
          )}

          <SettlementAndDutiesBanner cart={cart} />

          {!paidByGiftcard && availablePaymentMethods?.length && (
            <>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(value: string) => setPaymentMethod(value)}
              >
                {availablePaymentMethods.map((paymentMethod) => (
                  <div key={paymentMethod.id}>
                    {isStripeLike(paymentMethod.id) ? (
                      <StripeCardContainer
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                        paymentInfoMap={paymentInfoMap}
                        setCardBrand={setCardBrand}
                        setError={setError}
                        setCardComplete={setCardComplete}
                      />
                    ) : (
                      <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                      />
                    )}
                  </div>
                ))}
              </RadioGroup>
            </>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <Button
            size="large"
            className="mt-6 bg-[#0A0A0A] text-[#FAF9F6] hover:bg-[#1A1A1A] rounded-none h-12 px-8 text-xs uppercase tracking-[0.22em]"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={
              (isStripeLike(selectedPaymentMethod) && !cardComplete) ||
              (!selectedPaymentMethod && !paidByGiftcard)
            }
            data-testid="submit-payment-button"
          >
            {!activeSession && isStripeLike(selectedPaymentMethod)
              ? "Enter Card Details"
              : "Continue to Review"}
          </Button>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex items-start gap-x-6 w-full">
              <div className="flex flex-col flex-1">
                <Text className="text-xs uppercase tracking-[0.16em] text-[#0A0A0A]/55 mb-1">
                  Payment Method
                </Text>
                <Text
                  className="text-sm text-[#0A0A0A]"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[activeSession?.provider_id]?.title ||
                    activeSession?.provider_id}
                </Text>
              </div>
              <div className="flex flex-col flex-1">
                <Text className="text-xs uppercase tracking-[0.16em] text-[#0A0A0A]/55 mb-1">
                  Settlement Channel
                </Text>
                <div
                  className="flex gap-2 text-sm text-[#0A0A0A]/80 items-center"
                  data-testid="payment-details-summary"
                >
                  <Container className="flex items-center h-7 w-fit p-2 bg-[#F2EFE9] rounded-none shadow-none border border-[#0A0A0A]/15">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <CreditCard />
                    )}
                  </Container>
                  <Text className="text-xs text-[#0A0A0A]/75">
                    {isNgenius(activeSession?.provider_id)
                      ? "Network International · Hosted AED Page"
                      : isStripeLike(selectedPaymentMethod) && cardBrand
                      ? cardBrand
                      : "AED Settlement Ready"}
                  </Text>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          ) : null}
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default Payment
