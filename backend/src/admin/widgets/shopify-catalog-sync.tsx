import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"

type SyncedItem = {
  id: string
  title: string
  handle: string
  aedPrice: number
  imageCount: number
  variantCount: number
}

type SyncResponse = {
  success: boolean
  message?: string
  importedCount?: number
  skippedCount?: number
  errorCount?: number
  imported?: SyncedItem[]
  skipped?: Array<{ title: string; handle: string; reason: string }>
  errors?: Array<{ title: string; handle: string; error: string }>
}

type StatusInfo = {
  totalMedusaProducts: number
  syncedFromShopifyCount: number
  sourceDomain: string
}

const ShopifyCatalogSyncWidget = () => {
  const [statusInfo, setStatusInfo] = useState<StatusInfo | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [result, setResult] = useState<SyncResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadStatus = async () => {
    try {
      const res = await fetch("/admin/shopify-sync", {
        method: "GET",
        credentials: "include",
      })
      if (res.ok) {
        const data = (await res.json()) as StatusInfo
        setStatusInfo(data)
      }
    } catch {
      // ignore initial status fetch errors
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  const handleSync = async () => {
    setIsSyncing(true)
    setErrorMsg(null)
    setResult(null)

    try {
      const res = await fetch("/admin/shopify-sync", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ limit: 10 }),
      })

      const data = (await res.json()) as SyncResponse
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || `Sync failed with HTTP ${res.status}`)
      } else {
        setResult(data)
        await loadStatus()
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error during sync")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div
      style={{
        background: "var(--bg-base, #ffffff)",
        border: "1px solid var(--border-base, #e5e7eb)",
        borderRadius: "8px",
        padding: "16px 20px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--fg-base, #111827)",
              margin: 0,
            }}
          >
            Shopify Catalog Sync
          </h2>
          <p
            style={{
              fontSize: "12px",
              color: "var(--fg-subtle, #6b7280)",
              margin: "4px 0 0 0",
            }}
          >
            Idempotently imports up to 10 new published gowns from{" "}
            <strong>{statusInfo?.sourceDomain || "illusionline.com"}</strong>,
            re-hosts all photos on Railway S3, and adds Custom Made-to-Measure
            variants in AED.
            {statusInfo
              ? ` (${statusInfo.syncedFromShopifyCount} synced / ${statusInfo.totalMedusaProducts} total products)`
              : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSync}
          disabled={isSyncing}
          style={{
            background: isSyncing ? "#6b7280" : "#111827",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 14px",
            fontSize: "12px",
            fontWeight: 500,
            cursor: isSyncing ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {isSyncing
            ? "Syncing & Uploading to Railway S3..."
            : "Sync 10 Dresses from Shopify"}
        </button>
      </div>

      {errorMsg && (
        <div
          style={{
            marginTop: "12px",
            padding: "10px 12px",
            borderRadius: "6px",
            background: "rgba(220, 38, 38, 0.08)",
            color: "#b91c1c",
            fontSize: "12px",
          }}
        >
          {errorMsg}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: "14px",
            paddingTop: "12px",
            borderTop: "1px solid var(--border-base, #e5e7eb)",
            fontSize: "12px",
            color: "var(--fg-base, #111827)",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "8px" }}>
            Sync Complete: {result.importedCount ?? 0} imported ·{" "}
            {result.skippedCount ?? 0} existing skipped ·{" "}
            {result.errorCount ?? 0} errors
          </div>

          {result.imported && result.imported.length > 0 && (
            <ul
              style={{
                margin: 0,
                paddingLeft: "18px",
                display: "grid",
                gap: "4px",
              }}
            >
              {result.imported.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong>{" "}
                  <span style={{ color: "var(--fg-subtle, #6b7280)" }}>
                    (<code>{item.handle}</code> — AED {item.aedPrice} ·{" "}
                    {item.imageCount} S3 photos · {item.variantCount} variants)
                  </span>
                </li>
              ))}
            </ul>
          )}

          {result.errors && result.errors.length > 0 && (
            <div style={{ marginTop: "8px", color: "#b91c1c" }}>
              {result.errors.map((e) => (
                <div key={e.handle}>
                  Failed {e.title} ({e.handle}): {e.error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default ShopifyCatalogSyncWidget
