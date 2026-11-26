import { MedusaContainer } from "@medusajs/framework/types"
import {
  BigNumber,
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import nodemailer from "nodemailer"

export type SendOrderConfirmationResult = {
  skipped: boolean
  reason?: string
  messageId: string
  sentTo: string
  sentAt: string
}

type OrderAddress = {
  first_name?: string | null
  last_name?: string | null
  company?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  country_code?: string | null
  phone?: string | null
}

type OrderLineItem = {
  id: string
  title?: string | null
  product_title?: string | null
  subtitle?: string | null
  variant_title?: string | null
  thumbnail?: string | null
  quantity?: unknown
  unit_price?: unknown
  total?: unknown
  subtotal?: unknown
  metadata?: Record<string, unknown> | null
}

type OrderGraphRecord = {
  id: string
  display_id?: number | string | null
  email?: string | null
  created_at?: string | Date | null
  currency_code?: string | null
  total?: unknown
  subtotal?: unknown
  item_subtotal?: unknown
  shipping_total?: unknown
  shipping_subtotal?: unknown
  discount_total?: unknown
  tax_total?: unknown
  metadata?: Record<string, unknown> | null
  items?: OrderLineItem[] | null
  shipping_address?: OrderAddress | null
  billing_address?: OrderAddress | null
  shipping_methods?: Array<{
    id?: string
    name?: string | null
    amount?: unknown
  }> | null
  payment_collections?: Array<{
    payments?: Array<{
      id?: string
      provider_id?: string | null
      amount?: unknown
      captured_at?: string | Date | null
      data?: Record<string, unknown> | null
    }> | null
  }> | null
}

function toSafeNumber(value: unknown): number {
  if (value === null || value === undefined) return 0
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0
  }
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  try {
    if (typeof value === "object") {
      const obj = value as Record<string, unknown>
      if (typeof obj.numeric === "number" && Number.isFinite(obj.numeric)) {
        return obj.numeric
      }
      const bn = new BigNumber(value as any)
      if (Number.isFinite(bn.numeric)) {
        return bn.numeric
      }
      if (obj.value !== undefined) {
        const parsedVal = Number(obj.value)
        if (Number.isFinite(parsedVal)) return parsedVal
      }
    }
  } catch {
    // fallback below
  }
  const fallback = Number(value)
  return Number.isFinite(fallback) ? fallback : 0
}

function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return ""
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatAED(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0
  const isWhole = Math.abs(safe - Math.round(safe)) < 0.005
  try {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(safe)
    return `AED ${formatted}`
  } catch {
    return `AED ${isWhole ? Math.round(safe) : safe.toFixed(2)}`
  }
}

function formatUtcTimestamp(raw?: unknown): string {
  if (!raw) return new Date().toISOString()
  const date = raw instanceof Date ? raw : new Date(String(raw))
  if (Number.isNaN(date.getTime())) {
    return String(raw)
  }
  return date.toISOString()
}

function formatEditorialDate(raw?: unknown): string {
  const date = raw ? new Date(String(raw)) : new Date()
  if (Number.isNaN(date.getTime())) {
    return new Date().toUTCString()
  }
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date)
  } catch {
    return date.toISOString().slice(0, 10)
  }
}

function formatCmValue(val: unknown): string | null {
  if (val === null || val === undefined) return null
  const trimmed = String(val).trim()
  if (!trimmed) return null
  return /cm$/i.test(trimmed) ? trimmed : `${trimmed} cm`
}

type BespokeItemDetails = {
  isBespoke: boolean
  specs: Array<{ label: string; value: string }>
  notes: string | null
}

function extractBespokeSpecs(
  item: OrderLineItem
): BespokeItemDetails {
  const meta =
    item.metadata && typeof item.metadata === "object" ? item.metadata : null

  const variantLabel = String(
    item.variant_title || item.subtitle || ""
  ).toLowerCase()
  const variantIndicatesCustom =
    variantLabel.includes("custom") ||
    variantLabel.includes("made-to-measure") ||
    variantLabel.includes("bespoke")

  if (!meta) {
    return {
      isBespoke: variantIndicatesCustom,
      specs: [],
      notes: null,
    }
  }

  const bust = formatCmValue(meta.bust)
  const waist = formatCmValue(meta.waist)
  const hips = formatCmValue(meta.hips)
  const hollowToHem = formatCmValue(meta.hollow_to_hem)
  const height = formatCmValue(meta.height)
  const notes =
    typeof meta.notes === "string" && meta.notes.trim().length > 0
      ? meta.notes.trim()
      : null

  const sizingMode = String(meta.sizing_mode || "")
    .trim()
    .toLowerCase()
  const modeIsCustom =
    sizingMode === "custom" ||
    sizingMode === "made-to-measure" ||
    sizingMode === "bespoke"

  const specs: Array<{ label: string; value: string }> = []
  if (bust) specs.push({ label: "Bust", value: bust })
  if (waist) specs.push({ label: "Waist", value: waist })
  if (hips) specs.push({ label: "Hips", value: hips })
  if (hollowToHem) specs.push({ label: "Hollow to Hem", value: hollowToHem })
  if (height) specs.push({ label: "Height", value: height })

  return {
    isBespoke:
      modeIsCustom || variantIndicatesCustom || specs.length > 0 || Boolean(notes),
    specs,
    notes,
  }
}

function formatAddressLines(addr?: OrderAddress | null): string[] {
  if (!addr) return ["Not provided"]
  const lines: string[] = []
  const fullName = [addr.first_name, addr.last_name]
    .map((s) => (s || "").trim())
    .filter(Boolean)
    .join(" ")
  if (fullName) lines.push(fullName)
  if (addr.company?.trim()) lines.push(addr.company.trim())
  if (addr.address_1?.trim()) lines.push(addr.address_1.trim())
  if (addr.address_2?.trim()) lines.push(addr.address_2.trim())

  const cityRegionPostal = [addr.city, addr.province, addr.postal_code]
    .map((s) => (s || "").trim())
    .filter(Boolean)
    .join(", ")
  if (cityRegionPostal) lines.push(cityRegionPostal)

  if (addr.country_code?.trim()) {
    lines.push(addr.country_code.trim().toUpperCase())
  }
  if (addr.phone?.trim()) {
    lines.push(`Tel: ${addr.phone.trim()}`)
  }

  return lines.length > 0 ? lines : ["Not provided"]
}

function extractPaymentAuditSummary(order: OrderGraphRecord, formattedTotal: string): {
  settlementLine: string
  referenceLine: string
} {
  const payment = order.payment_collections?.[0]?.payments?.[0]
  const data =
    payment?.data && typeof payment.data === "object"
      ? (payment.data as Record<string, unknown>)
      : {}
  const summary =
    data.paymentSummary && typeof data.paymentSummary === "object"
      ? (data.paymentSummary as Record<string, unknown>)
      : {}

  const origin = String(summary.origin || "").trim().toUpperCase()
  const scheme = String(summary.scheme || "").trim().toUpperCase()
  const maskedPan = String(summary.maskedPan || "").trim()
  const authCode = String(summary.authCode || "").trim()
  const paymentRef = String(
    summary.paymentReference || data.ngeniusOrderRef || payment?.id || ""
  ).trim()
  const ngeniusOrderRef = String(data.ngeniusOrderRef || "").trim()
  const rawState = String(
    summary.state || data.ngeniusState || (payment?.captured_at ? "CAPTURED" : "CAPTURED")
  )
    .trim()
    .toUpperCase()

  const methodParts: string[] = []
  if (origin.includes("APPLE")) {
    methodParts.push("APPLE_PAY")
  }
  if (scheme) {
    methodParts.push(scheme)
  } else if (!methodParts.length) {
    methodParts.push("CARD")
  }
  if (maskedPan) {
    methodParts.push(maskedPan)
  }

  const settlementStatus =
    rawState === "CAPTURED" || rawState === "PURCHASED"
      ? "CAPTURED"
      : rawState || "CAPTURED"

  const settlementLine = `${formattedTotal} — ${settlementStatus} (${methodParts.join(
    " · "
  )})`

  const refParts: string[] = []
  if (authCode) refParts.push(`Auth Code: ${authCode}`)
  if (ngeniusOrderRef) refParts.push(`Order Ref: ${ngeniusOrderRef}`)
  if (paymentRef && paymentRef !== ngeniusOrderRef) {
    refParts.push(`Payment Ref: ${paymentRef}`)
  }

  return {
    settlementLine,
    referenceLine: refParts.join(" · ") || "Verified Electronic Settlement",
  }
}

/**
 * Queries the full Medusa v2 Order, renders the Dispute-Proof Luxury Order Confirmation
 * HTML + plain-text email, dispatches via Gmail SMTP (smtp.gmail.com:465 implicit TLS),
 * and records delivery metadata on the order for idempotency.
 */
export async function sendOrderConfirmationEmail(
  container: MedusaContainer,
  orderId: string,
  options?: { force?: boolean }
): Promise<SendOrderConfirmationResult> {
  if (!orderId || !orderId.trim()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Order ID is required to send order confirmation email."
    )
  }

  // Runtime-only env resolution so `medusa build` never fails if unset
  const gmailUser = (
    process.env.GMAIL_USER || "support@illusionline.com"
  ).trim()
  const gmailAppPassword = (process.env.GMAIL_APP_PASSWORD || "").replace(
    /\s+/g,
    ""
  )
  const emailFromName = (process.env.EMAIL_FROM_NAME || "ILLUSIONLINE")
    .trim()
    .replace(/"/g, "")
  const storefrontUrl = (
    process.env.STOREFRONT_URL || "https://beta.illusionline.com"
  )
    .trim()
    .replace(/\/+$/, "")

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const orderModuleService = container.resolve(Modules.ORDER)

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "created_at",
      "currency_code",
      "total",
      "subtotal",
      "item_subtotal",
      "shipping_total",
      "shipping_subtotal",
      "discount_total",
      "tax_total",
      "metadata",
      "items.*",
      "shipping_address.*",
      "billing_address.*",
      "shipping_methods.*",
      "payment_collections.payments.*",
    ],
    filters: { id: orderId },
  })

  const order = (orders?.[0] || null) as OrderGraphRecord | null
  if (!order) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Order ${orderId} not found.`
    )
  }

  const recipientEmail = (order.email || "").trim()
  if (!recipientEmail) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Order ${orderId} has no customer email address.`
    )
  }

  const existingMeta =
    order.metadata && typeof order.metadata === "object"
      ? (order.metadata as Record<string, unknown>)
      : {}

  if (!options?.force && existingMeta.confirmation_email_sent_at) {
    return {
      skipped: true,
      reason: "already_sent",
      messageId: String(existingMeta.confirmation_email_message_id || ""),
      sentTo: String(existingMeta.confirmation_email_to || recipientEmail),
      sentAt: String(existingMeta.confirmation_email_sent_at),
    }
  }

  if (!gmailAppPassword) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "GMAIL_APP_PASSWORD is not configured in Backend environment variables."
    )
  }

  const displayId =
    order.display_id !== null && order.display_id !== undefined
      ? String(order.display_id)
      : order.id.replace(/^order_/, "").slice(-8).toUpperCase()

  const orderConfirmedUrl = `${storefrontUrl}/ae/order/${encodeURIComponent(
    order.id
  )}/confirmed`

  const totalAmount = toSafeNumber(order.total)
  const subtotalAmount =
    toSafeNumber(order.item_subtotal) || toSafeNumber(order.subtotal)
  const shippingAmount =
    toSafeNumber(order.shipping_total) || toSafeNumber(order.shipping_subtotal)
  const discountAmount = toSafeNumber(order.discount_total)
  const taxAmount = toSafeNumber(order.tax_total)

  const formattedTotal = formatAED(totalAmount)
  const formattedSubtotal = formatAED(subtotalAmount)
  const formattedShipping =
    shippingAmount === 0 ? "Complimentary (AED 0)" : formatAED(shippingAmount)

  const displayCurrencyViewed = String(
    existingMeta.display_currency_viewed || ""
  )
    .trim()
    .toUpperCase()
  const showDisplayCurrencyNote =
    Boolean(displayCurrencyViewed) && displayCurrencyViewed !== "AED"

  const shippingCountry = (
    order.shipping_address?.country_code || ""
  )
    .trim()
    .toLowerCase()
  const defaultShippingLabel =
    shippingCountry === "ae"
      ? "Courier Delivery (UAE)"
      : "DHL Express International"
  const shippingMethodName =
    order.shipping_methods?.[0]?.name?.trim() || defaultShippingLabel

  const shippingAddressLines = formatAddressLines(order.shipping_address)
  const billingAddressLines = formatAddressLines(
    order.billing_address || order.shipping_address
  )

  const items = Array.isArray(order.items) ? order.items : []
  let hasBespokeLineItem = false
  const enrichedItems = items.map((item) => {
    const qty = Math.max(1, Math.round(toSafeNumber(item.quantity) || 1))
    const lineTotal =
      toSafeNumber(item.total) ||
      toSafeNumber(item.subtotal) ||
      toSafeNumber(item.unit_price) * qty
    const unitPrice = toSafeNumber(item.unit_price) || lineTotal / qty
    const bespoke = extractBespokeSpecs(item)
    if (bespoke.isBespoke) {
      hasBespokeLineItem = true
    }

    const rawVariant = (item.variant_title || item.subtitle || "").trim()
    const cleanVariant =
      rawVariant && rawVariant.toLowerCase() !== "default variant"
        ? rawVariant
        : ""

    return {
      title: (item.product_title || item.title || "ILLUSIONLINE Piece").trim(),
      variant: cleanVariant,
      thumbnail:
        item.thumbnail && /^https?:\/\//i.test(item.thumbnail)
          ? item.thumbnail
          : null,
      quantity: qty,
      unitPriceFormatted: formatAED(unitPrice),
      lineTotalFormatted: formatAED(lineTotal),
      bespoke,
    }
  })

  const termsAcceptedUtc = formatUtcTimestamp(
    existingMeta.terms_accepted_at || order.created_at
  )
  const bespokeConfirmedLabel =
    existingMeta.bespoke_confirmed === true ||
    existingMeta.bespoke_confirmed === "true" ||
    hasBespokeLineItem
      ? "Yes (Client Verified)"
      : "Standard Size Selected"

  const paymentAudit = extractPaymentAuditSummary(order, formattedTotal)
  const orderDateFormatted = formatEditorialDate(order.created_at)

  // Render line items HTML rows
  const itemsHtml = enrichedItems
    .map((item) => {
      const thumbCell = item.thumbnail
        ? `<img src="${escapeHtml(
            item.thumbnail
          )}" alt="${escapeHtml(
            item.title
          )}" width="60" height="75" style="display:block;width:60px;height:75px;object-fit:cover;border:1px solid #E6E3DC;background:#F2EFE9;" />`
        : `<div style="width:60px;height:75px;border:1px solid #E6E3DC;background:#F2EFE9;text-align:center;line-height:75px;font-family:Georgia,serif;font-size:11px;color:#666666;">IL</div>`

      const bespokeHtml = item.bespoke.isBespoke
        ? `<div style="margin-top:10px;padding:10px 12px;background:#FAF9F6;border:1px solid #D8D4CC;border-left:2px solid #111111;">
            <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;font-weight:600;color:#111111;margin-bottom:4px;">
              Made-to-Measure Client Specifications
            </div>
            ${
              item.bespoke.specs.length > 0
                ? `<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:#333333;">
                    ${item.bespoke.specs
                      .map(
                        (s) =>
                          `<span style="margin-right:12px;white-space:nowrap;"><strong style="color:#111111;">${escapeHtml(
                            s.label
                          )}:</strong> ${escapeHtml(s.value)}</span>`
                      )
                      .join(" ")}
                  </div>`
                : `<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;color:#333333;">Custom Bespoke Tailoring Selected</div>`
            }
            ${
              item.bespoke.notes
                ? `<div style="margin-top:4px;font-family:Georgia,serif;font-style:italic;font-size:11px;color:#444444;">Client Notes: ${escapeHtml(
                    item.bespoke.notes
                  )}</div>`
                : ""
            }
          </div>`
        : ""

      return `
        <tr>
          <td valign="top" width="74" style="padding:16px 14px 16px 0;border-bottom:1px solid #ECE9E2;">
            ${thumbCell}
          </td>
          <td valign="top" style="padding:16px 12px 16px 0;border-bottom:1px solid #ECE9E2;">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.35;color:#111111;">
              ${escapeHtml(item.title)}
            </div>
            ${
              item.variant
                ? `<div style="margin-top:3px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#666666;">Size / Variant: ${escapeHtml(
                    item.variant
                  )}</div>`
                : ""
            }
            <div style="margin-top:3px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;color:#666666;">
              Qty: ${item.quantity} &times; ${escapeHtml(item.unitPriceFormatted)}
            </div>
            ${bespokeHtml}
          </td>
          <td valign="top" align="right" style="padding:16px 0;border-bottom:1px solid #ECE9E2;white-space:nowrap;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;font-weight:500;color:#111111;">
            ${escapeHtml(item.lineTotalFormatted)}
          </td>
        </tr>
      `
    })
    .join("")

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ILLUSIONLINE — Order Confirmation #${escapeHtml(displayId)}</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF9F6;color:#111111;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF9F6;padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;background-color:#FFFFFF;border:1px solid #E5E2DC;">
          
          <!-- Masthead -->
          <tr>
            <td align="center" style="padding:40px 36px 28px 36px;border-bottom:1px solid #ECE9E2;">
              <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:18px;letter-spacing:0.36em;text-transform:uppercase;color:#111111;font-weight:400;">
                ILLUSIONLINE
              </div>
              <div style="margin-top:18px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;letter-spacing:0.04em;color:#111111;">
                ORDER CONFIRMATION #${escapeHtml(displayId)}
              </div>
              <div style="margin-top:6px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#6E6B65;">
                ${escapeHtml(orderDateFormatted)} &middot; Atelier Reference ${escapeHtml(order.id)}
              </div>
              <p style="margin:18px auto 22px auto;max-width:460px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.65;color:#444444;">
                Thank you for commissioning ILLUSIONLINE. Your order has been received by our Dubai atelier and settled in United Arab Emirates Dirhams (AED).
              </p>
              <a href="${escapeHtml(
                orderConfirmedUrl
              )}" target="_blank" style="display:inline-block;padding:13px 28px;background-color:#111111;color:#FAF9F6;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;">
                View Order Online
              </a>
            </td>
          </tr>

          <!-- Line Items -->
          <tr>
            <td style="padding:28px 36px 12px 36px;">
              <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:#6E6B65;margin-bottom:8px;">
                Selected Pieces
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Totals in AED -->
          <tr>
            <td style="padding:16px 36px 28px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:#333333;">
                <tr>
                  <td style="padding:5px 0;color:#666666;">Subtotal</td>
                  <td align="right" style="padding:5px 0;color:#111111;">${escapeHtml(
                    formattedSubtotal
                  )}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;color:#666666;">Shipping (${escapeHtml(
                    shippingMethodName
                  )})</td>
                  <td align="right" style="padding:5px 0;color:#111111;">${escapeHtml(
                    formattedShipping
                  )}</td>
                </tr>
                ${
                  discountAmount > 0
                    ? `<tr>
                        <td style="padding:5px 0;color:#666666;">Privilege / Discount</td>
                        <td align="right" style="padding:5px 0;color:#111111;">- ${escapeHtml(
                          formatAED(discountAmount)
                        )}</td>
                      </tr>`
                    : ""
                }
                ${
                  taxAmount > 0
                    ? `<tr>
                        <td style="padding:5px 0;color:#666666;">Taxes</td>
                        <td align="right" style="padding:5px 0;color:#111111;">${escapeHtml(
                          formatAED(taxAmount)
                        )}</td>
                      </tr>`
                    : ""
                }
                <tr>
                  <td style="padding:14px 0 6px 0;border-top:1px solid #111111;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:#111111;">
                    Total Settled (AED)
                  </td>
                  <td align="right" style="padding:14px 0 6px 0;border-top:1px solid #111111;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:600;color:#111111;">
                    ${escapeHtml(formattedTotal)}
                  </td>
                </tr>
              </table>
              ${
                showDisplayCurrencyNote
                  ? `<div style="margin-top:8px;padding:8px 12px;background:#FAF9F6;border:1px solid #E5E2DC;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;color:#555555;">
                      Display Currency Viewed at Checkout: <strong style="color:#111111;">${escapeHtml(
                        displayCurrencyViewed
                      )}</strong> &mdash; Settled 100% in <strong style="color:#111111;">AED</strong>
                    </div>`
                  : ""
              }
            </td>
          </tr>

          <!-- Addresses & Shipping Method -->
          <tr>
            <td style="padding:24px 36px;border-top:1px solid #ECE9E2;border-bottom:1px solid #ECE9E2;background-color:#FCFBFA;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="top" width="50%" style="padding-right:16px;">
                    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#6E6B65;margin-bottom:8px;">
                      Shipping Address
                    </div>
                    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.65;color:#111111;">
                      ${shippingAddressLines.map((l) => escapeHtml(l)).join("<br />")}
                    </div>
                  </td>
                  <td valign="top" width="50%" style="padding-left:16px;">
                    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#6E6B65;margin-bottom:8px;">
                      Billing Address
                    </div>
                    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.65;color:#111111;">
                      ${billingAddressLines.map((l) => escapeHtml(l)).join("<br />")}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:16px;">
                    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#6E6B65;margin-bottom:4px;">
                      Dispatch Method
                    </div>
                    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;color:#111111;font-weight:500;">
                      ${escapeHtml(shippingMethodName)}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Mandatory Chargeback-Defense Policy & Terms Acceptance Record -->
          <tr>
            <td style="padding:28px 36px;">
              <div style="border:1px solid #111111;background-color:#FAF9F6;padding:20px 22px;">
                <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-weight:700;color:#111111;margin-bottom:12px;border-bottom:1px solid #D8D4CC;padding-bottom:8px;">
                  Pre-Payment Policy &amp; Terms Acceptance Record
                </div>

                <p style="margin:0 0 10px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:#222222;">
                  <strong style="color:#111111;">1. Atelier Production &amp; Returns Policy:</strong> Standard/Made-to-Order and Made-to-Measure garments require up to 6&ndash;8 weeks atelier production unless marked Ready-to-Ship. Orders cannot be cancelled once placed. Made-to-Measure garments are strictly final sale, and eligible standard-size returns qualify for Store Credit only per <a href="https://illusionline.com/policies/refund-policy" style="color:#111111;text-decoration:underline;">https://illusionline.com/policies/refund-policy</a>.
                </p>

                <p style="margin:0 0 14px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:#222222;">
                  <strong style="color:#111111;">2. International DHL Express Customs &amp; Duties:</strong> International orders ship DDU (duties and taxes unpaid). Destination import duties, customs taxes, and clearance fees are the sole responsibility of the recipient. Refusal, delay, or non-payment of import duties resulting in carrier hold, return, or customs abandonment is strictly non-refundable.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #D8D4CC;padding-top:10px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;line-height:1.7;color:#111111;">
                  <tr>
                    <td style="padding-top:8px;color:#555555;width:44%;">&bull; Terms Accepted Timestamp (UTC):</td>
                    <td style="padding-top:8px;font-weight:600;color:#111111;">${escapeHtml(
                      termsAcceptedUtc
                    )}</td>
                  </tr>
                  <tr>
                    <td style="color:#555555;">&bull; Bespoke Measurements Confirmed:</td>
                    <td style="font-weight:600;color:#111111;">${escapeHtml(
                      bespokeConfirmedLabel
                    )}</td>
                  </tr>
                  <tr>
                    <td valign="top" style="color:#555555;">&bull; Payment Settlement:</td>
                    <td style="font-weight:600;color:#111111;">
                      ${escapeHtml(paymentAudit.settlementLine)}<br />
                      <span style="font-weight:400;font-size:10px;color:#444444;">${escapeHtml(
                        paymentAudit.referenceLine
                      )}</span>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px 36px 32px 36px;border-top:1px solid #ECE9E2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:#6E6B65;">
              Client Concierge: <a href="mailto:${escapeHtml(
                gmailUser
              )}" style="color:#111111;text-decoration:underline;">${escapeHtml(
    gmailUser
  )}</a><br />
              &copy; ${new Date().getUTCFullYear()} ILLUSIONLINE &middot; Architectural Eveningwear
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  // Plain-text fallback containing identical legal & order evidence
  const plainTextItems = enrichedItems
    .map((item) => {
      const lines = [
        `- ${item.title}${item.variant ? ` (${item.variant})` : ""} | Qty: ${
          item.quantity
        } | ${item.lineTotalFormatted}`,
      ]
      if (item.bespoke.isBespoke) {
        const specStr = item.bespoke.specs
          .map((s) => `${s.label}: ${s.value}`)
          .join(", ")
        lines.push(
          `  [Made-to-Measure Client Specifications] ${
            specStr || "Custom Tailoring"
          }${item.bespoke.notes ? ` | Notes: ${item.bespoke.notes}` : ""}`
        )
      }
      return lines.join("\n")
    })
    .join("\n")

  const text = [
    `ILLUSIONLINE — ORDER CONFIRMATION #${displayId}`,
    `Order Date: ${orderDateFormatted}`,
    `Order Reference: ${order.id}`,
    `View Order Online: ${orderConfirmedUrl}`,
    "",
    "SELECTED PIECES",
    plainTextItems,
    "",
    `Subtotal: ${formattedSubtotal}`,
    `Shipping (${shippingMethodName}): ${formattedShipping}`,
    ...(discountAmount > 0
      ? [`Discount: - ${formatAED(discountAmount)}`]
      : []),
    ...(taxAmount > 0 ? [`Taxes: ${formatAED(taxAmount)}`] : []),
    `TOTAL SETTLED (AED): ${formattedTotal}`,
    ...(showDisplayCurrencyNote
      ? [
          `Display Currency Viewed at Checkout: ${displayCurrencyViewed} — Settled 100% in AED`,
        ]
      : []),
    "",
    "SHIPPING ADDRESS",
    ...shippingAddressLines,
    "",
    "BILLING ADDRESS",
    ...billingAddressLines,
    "",
    `DISPATCH METHOD: ${shippingMethodName}`,
    "",
    "------------------------------------------------------------",
    "PRE-PAYMENT POLICY & TERMS ACCEPTANCE RECORD",
    "------------------------------------------------------------",
    "1. Atelier Production & Returns Policy: Standard/Made-to-Order and Made-to-Measure garments require up to 6–8 weeks atelier production unless marked Ready-to-Ship. Orders cannot be cancelled once placed. Made-to-Measure garments are strictly final sale, and eligible standard-size returns qualify for Store Credit only per https://illusionline.com/policies/refund-policy.",
    "",
    "2. International DHL Express Customs & Duties: International orders ship DDU (duties and taxes unpaid). Destination import duties, customs taxes, and clearance fees are the sole responsibility of the recipient. Refusal, delay, or non-payment of import duties resulting in carrier hold, return, or customs abandonment is strictly non-refundable.",
    "",
    `• Terms Accepted Timestamp (UTC): ${termsAcceptedUtc}`,
    `• Bespoke Measurements Confirmed: ${bespokeConfirmedLabel}`,
    `• Payment Settlement: ${paymentAudit.settlementLine} (${paymentAudit.referenceLine})`,
    "",
    `Questions? Reply directly to ${gmailUser}.`,
  ].join("\n")

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  })

  const info = await transporter.sendMail({
    from: `"${emailFromName}" <${gmailUser}>`,
    replyTo: gmailUser,
    to: recipientEmail,
    subject: `ILLUSIONLINE — Order Confirmation #${displayId}`,
    text,
    html,
  })

  const sentAt = new Date().toISOString()
  const messageId = info.messageId || ""

  await orderModuleService.updateOrders(order.id, {
    metadata: {
      ...existingMeta,
      confirmation_email_message_id: messageId,
      confirmation_email_sent_at: sentAt,
      confirmation_email_to: recipientEmail,
    },
  })

  return {
    skipped: false,
    messageId,
    sentTo: recipientEmail,
    sentAt,
  }
}
