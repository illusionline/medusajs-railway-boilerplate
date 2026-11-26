import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"

type OrderWidgetData = {
  id: string
  display_id?: number | string
  email?: string | null
  metadata?: Record<string, unknown> | null
}

type WidgetProps = {
  data: OrderWidgetData
}

const OrderConfirmationEmailWidget = ({ data }: WidgetProps) => {
  const initialSentAt =
    typeof data?.metadata?.confirmation_email_sent_at === "string"
      ? data.metadata.confirmation_email_sent_at
      : null
  const initialSentTo =
    typeof data?.metadata?.confirmation_email_to === "string"
      ? data.metadata.confirmation_email_to
      : data?.email || null

  const [sentAt, setSentAt] = useState<string | null>(initialSentAt)
  const [sentTo, setSentTo] = useState<string | null>(initialSentTo)
  const [sending, setSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [justSent, setJustSent] = useState(false)

  useEffect(() => {
    setSentAt(initialSentAt)
    setSentTo(initialSentTo)
  }, [initialSentAt, initialSentTo])

  const handleSend = async () => {
    if (!data?.id) return
    setSending(true)
    setErrorMessage(null)
    setJustSent(false)

    try {
      const response = await fetch(
        `/admin/orders/${encodeURIComponent(data.id)}/send-confirmation`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      const payload = (await response.json()) as {
        success?: boolean
        sentAt?: string
        sentTo?: string
        message?: string
      }

      if (!response.ok || !payload.success) {
        setErrorMessage(
          payload.message || `Failed to send email (HTTP ${response.status})`
        )
      } else {
        setSentAt(payload.sentAt || new Date().toISOString())
        setSentTo(payload.sentTo || data.email || null)
        setJustSent(true)
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Network error sending email"
      )
    } finally {
      setSending(false)
    }
  }

  const formattedSentAt = sentAt
    ? new Date(sentAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null

  return (
    <div
      style={{
        background: "var(--bg-base, #ffffff)",
        border: "1px solid var(--border-base, #e5e7eb)",
        borderRadius: "8px",
        boxShadow:
          "var(--elevation-card-rest, 0 1px 2px 0 rgba(0, 0, 0, 0.05))",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          padding: "14px 20px",
          borderBottom: "1px solid var(--border-base, #e5e7eb)",
        }}
      >
        <h2
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--fg-base, #111827)",
            margin: 0,
          }}
        >
          Order Confirmation Email
        </h2>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "2px 8px",
            borderRadius: "9999px",
            fontSize: "11px",
            fontWeight: 500,
            background: sentAt
              ? "rgba(22, 163, 74, 0.12)"
              : "rgba(107, 114, 128, 0.12)",
            color: sentAt ? "#15803d" : "var(--fg-subtle, #6b7280)",
          }}
        >
          {sentAt ? "Sent" : "Not Sent"}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "16px 20px",
        }}
      >
        {sentAt ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <p
              style={{
                fontSize: "12px",
                lineHeight: 1.45,
                color: "var(--fg-subtle, #6b7280)",
                margin: 0,
              }}
            >
              Delivered to{" "}
              <strong style={{ color: "var(--fg-base, #111827)" }}>
                {sentTo || data?.email || "client"}
              </strong>
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "var(--fg-muted, #9ca3af)",
                margin: 0,
              }}
            >
              Last sent: {formattedSentAt}
            </p>
          </div>
        ) : (
          <p
            style={{
              fontSize: "12px",
              lineHeight: 1.45,
              color: "var(--fg-subtle, #6b7280)",
              margin: 0,
            }}
          >
            Dispatches the dispute-proof ILLUSIONLINE receipt (with AED
            settlement &amp; policy audit record) to{" "}
            <strong style={{ color: "var(--fg-base, #111827)" }}>
              {data?.email || "customer"}
            </strong>
            .
          </p>
        )}

        {justSent && (
          <div
            style={{
              padding: "8px 10px",
              borderRadius: "6px",
              background: "rgba(22, 163, 74, 0.08)",
              color: "#15803d",
              fontSize: "11px",
            }}
          >
            Confirmation receipt dispatched via support@illusionline.com.
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              padding: "8px 10px",
              borderRadius: "6px",
              background: "rgba(220, 38, 38, 0.08)",
              color: "#b91c1c",
              fontSize: "11px",
            }}
          >
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !data?.id}
          style={{
            width: "100%",
            marginTop: "2px",
            background: sending ? "#6b7280" : "#111827",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 12px",
            fontSize: "12px",
            fontWeight: 500,
            cursor: sending || !data?.id ? "not-allowed" : "pointer",
          }}
        >
          {sending
            ? "Sending via Gmail SMTP..."
            : "Send / Resend Order Confirmation (Gmail)"}
        </button>
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default OrderConfirmationEmailWidget
