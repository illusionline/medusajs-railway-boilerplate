import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { sendOrderConfirmationEmail } from "../../../../../lib/order-confirmation-email"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const orderId = req.params.id

  try {
    const result = await sendOrderConfirmationEmail(req.scope, orderId, {
      force: true,
    })

    logger.info(
      `[order-email] Manual confirmation email dispatched for order ${orderId} to ${result.sentTo} (${result.messageId}).`
    )

    res.status(200).json({
      success: true,
      messageId: result.messageId,
      sentTo: result.sentTo,
      sentAt: result.sentAt,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error(
      `[order-email] Manual confirmation email failed for order ${orderId}: ${message}`
    )

    res.status(500).json({
      success: false,
      message,
    })
  }
}
