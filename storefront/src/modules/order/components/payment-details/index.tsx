import { Container, Heading, Text } from "@medusajs/ui"

import { isNgenius, isStripeLike, paymentInfoMap } from "@lib/constants"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import Divider from "@modules/common/components/divider"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0]?.payments?.[0]
  const ngeniusSummary = payment?.data?.paymentSummary as
    | { scheme?: string; maskedPan?: string; origin?: string }
    | undefined

  return (
    <div>
      <Heading
        level="h2"
        className="flex flex-row font-display text-3xl font-light text-[#0A0A0A] my-6"
      >
        Payment
      </Heading>
      <div>
        {payment && (
          <div className="flex items-start gap-x-6 w-full">
            <div className="flex flex-col w-1/3">
              <Text className="text-xs uppercase tracking-[0.16em] text-[#0A0A0A]/55 mb-1">
                Payment Method
              </Text>
              <Text
                className="text-sm text-[#0A0A0A]"
                data-testid="payment-method"
              >
                {paymentInfoMap[payment.provider_id]?.title ||
                  payment.provider_id}
              </Text>
            </div>
            <div className="flex flex-col w-2/3">
              <Text className="text-xs uppercase tracking-[0.16em] text-[#0A0A0A]/55 mb-1">
                Settlement Details
              </Text>
              <div className="flex gap-2.5 text-sm text-[#0A0A0A]/80 items-center">
                <Container className="flex items-center h-7 w-fit p-2 bg-[#F2EFE9] rounded-none shadow-none border border-[#0A0A0A]/15">
                  {paymentInfoMap[payment.provider_id]?.icon}
                </Container>
                <Text data-testid="payment-amount" className="text-xs">
                  {isNgenius(payment.provider_id) && ngeniusSummary?.maskedPan
                    ? `${ngeniusSummary.scheme ? `${ngeniusSummary.scheme} ` : ""}${ngeniusSummary.maskedPan} · ${convertToLocale({
                        amount: payment.amount,
                        currency_code: order.currency_code,
                      })}`
                    : isStripeLike(payment.provider_id) &&
                      payment.data?.card_last4
                    ? `**** **** **** ${payment.data.card_last4}`
                    : `${convertToLocale({
                        amount: payment.amount,
                        currency_code: order.currency_code,
                      })} settled in AED`}
                </Text>
              </div>
            </div>
          </div>
        )}
      </div>

      <Divider className="mt-8" />
    </div>
  )
}

export default PaymentDetails
