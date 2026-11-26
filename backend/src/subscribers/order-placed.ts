import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { sendOrderConfirmationEmail } from "../lib/order-confirmation-email"

export default async function orderPlacedEmailSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const orderId = data?.id

  if (!orderId) {
    logger.warn("[order-email] order.placed event received without order id.")
    return
  }

  try {
    const result = await sendOrderConfirmationEmail(container, orderId, {
      force: false,
    })

    if (result.skipped) {
      logger.info(
        `[order-email] Skipped duplicate confirmation email for order ${orderId} (already sent at ${result.sentAt}).`
      )
    } else {
      logger.info(
        `[order-email] Sent order confirmation email for order ${orderId} to ${result.sentTo} (Message-ID: ${result.messageId}).`
      )
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error(
      `[order-email] Non-fatal SMTP error sending confirmation for order ${orderId}: ${message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
