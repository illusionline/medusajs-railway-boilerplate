"use client"

import { isManual, isNgenius, isStripeLike } from "@lib/constants"
import { useDisplayCurrency } from "@lib/context/display-currency-context"
import {
  placeOrder,
  prepareNgeniusCheckoutRedirect,
  recordCheckoutPolicyConfirmation,
} from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import { useParams } from "next/navigation"
import React, { useState } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  policyAccepted?: boolean
  bespokeConfirmed?: boolean
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  policyAccepted = false,
  bespokeConfirmed = false,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1 ||
    !policyAccepted

  const paymentSession =
    cart.payment_collection?.payment_sessions?.find(
      (s) => s.status === "pending"
    ) || cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isNgenius(paymentSession?.provider_id):
      return (
        <NgeniusPaymentButton
          notReady={notReady}
          cart={cart}
          bespokeConfirmed={bespokeConfirmed}
          data-testid={dataTestId}
        />
      )
    case isStripeLike(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          bespokeConfirmed={bespokeConfirmed}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton
          notReady={notReady}
          cart={cart}
          bespokeConfirmed={bespokeConfirmed}
          data-testid={dataTestId}
        />
      )
    default:
      return (
        <button
          type="button"
          disabled
          className="w-full h-14 bg-[#0A0A0A]/20 text-[#0A0A0A]/50 text-xs uppercase tracking-[0.24em] cursor-not-allowed"
        >
          Select a Payment Method
        </button>
      )
  }
}

const NgeniusPaymentButton = ({
  notReady,
  cart,
  bespokeConfirmed,
  "data-testid": dataTestId,
}: {
  notReady: boolean
  cart: HttpTypes.StoreCart
  bespokeConfirmed: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { displayCurrency, appliedRate, formatAED } = useDisplayCurrency()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "ae"

  const handleRedirectToNgenius = async () => {
    setSubmitting(true)
    setErrorMessage(null)

    try {
      const { paymentUrl } = await prepareNgeniusCheckoutRedirect({
        countryCode,
        bespokeConfirmed,
        displayCurrencyViewed: displayCurrency,
        appliedFxRate: appliedRate,
      })

      window.location.assign(paymentUrl)
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "Unable to connect to Network International Hosted Payment Page. Please try again."
      )
      setSubmitting(false)
    }
  }

  const isButtonDisabled = notReady || submitting

  return (
    <>
      <button
        type="button"
        disabled={isButtonDisabled}
        onClick={handleRedirectToNgenius}
        data-testid={dataTestId || "submit-order-button"}
        className={clx(
          "w-full h-14 text-xs uppercase tracking-[0.24em] font-medium transition-colors duration-300 flex items-center justify-center",
          isButtonDisabled
            ? "bg-[#0A0A0A]/20 text-[#0A0A0A]/50 cursor-not-allowed"
            : "bg-[#0A0A0A] text-[#FAF9F6] hover:bg-[#1A1A1A]"
        )}
      >
        {submitting
          ? "Redirecting to Secure Payment..."
          : `Proceed to Card / Apple Pay · ${formatAED(cart?.total ?? 0)}`}
      </button>
      <ErrorMessage
        error={errorMessage}
        data-testid="ngenius-payment-error-message"
      />
    </>
  )
}

const StripePaymentButton = ({
  cart,
  notReady,
  bespokeConfirmed,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  bespokeConfirmed: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { displayCurrency, appliedRate, formatAED } = useDisplayCurrency()

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        if (
          err?.digest?.startsWith("NEXT_REDIRECT") ||
          err?.message === "NEXT_REDIRECT"
        ) {
          throw err
        }
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false
  const isButtonDisabled = disabled || notReady || submitting

  const handlePayment = async () => {
    setSubmitting(true)
    setErrorMessage(null)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    try {
      await recordCheckoutPolicyConfirmation({
        bespokeConfirmed,
        displayCurrencyViewed: displayCurrency,
        appliedFxRate: appliedRate,
      })
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Unable to record order confirmation. Please try again."
      )
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
            return
          }

          setErrorMessage(error.message || null)
          setSubmitting(false)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        setSubmitting(false)
        return
      })
  }

  return (
    <>
      <button
        type="button"
        disabled={isButtonDisabled}
        onClick={handlePayment}
        data-testid={dataTestId}
        className={clx(
          "w-full h-14 text-xs uppercase tracking-[0.24em] font-medium transition-colors duration-300 flex items-center justify-center",
          isButtonDisabled
            ? "bg-[#0A0A0A]/20 text-[#0A0A0A]/50 cursor-not-allowed"
            : "bg-[#0A0A0A] text-[#FAF9F6] hover:bg-[#1A1A1A]"
        )}
      >
        {submitting
          ? "Processing Order..."
          : `Place Order · ${formatAED(cart?.total ?? 0)}`}
      </button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({
  notReady,
  cart,
  bespokeConfirmed,
  "data-testid": dataTestId,
}: {
  notReady: boolean
  cart: HttpTypes.StoreCart
  bespokeConfirmed: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { displayCurrency, appliedRate, formatAED } = useDisplayCurrency()

  const handlePayment = async () => {
    setSubmitting(true)
    setErrorMessage(null)

    try {
      await recordCheckoutPolicyConfirmation({
        bespokeConfirmed,
        displayCurrencyViewed: displayCurrency,
        appliedFxRate: appliedRate,
      })

      await placeOrder()
    } catch (err: any) {
      if (
        err?.digest?.startsWith("NEXT_REDIRECT") ||
        err?.message === "NEXT_REDIRECT"
      ) {
        throw err
      }
      setErrorMessage(err?.message || "Unable to complete order.")
    } finally {
      setSubmitting(false)
    }
  }

  const isButtonDisabled = notReady || submitting

  return (
    <>
      <button
        type="button"
        disabled={isButtonDisabled}
        onClick={handlePayment}
        data-testid={dataTestId || "submit-order-button"}
        className={clx(
          "w-full h-14 text-xs uppercase tracking-[0.24em] font-medium transition-colors duration-300 flex items-center justify-center",
          isButtonDisabled
            ? "bg-[#0A0A0A]/20 text-[#0A0A0A]/50 cursor-not-allowed"
            : "bg-[#0A0A0A] text-[#FAF9F6] hover:bg-[#1A1A1A]"
        )}
      >
        {submitting
          ? "Processing Order..."
          : `Place Order · ${formatAED(cart?.total ?? 0)}`}
      </button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
