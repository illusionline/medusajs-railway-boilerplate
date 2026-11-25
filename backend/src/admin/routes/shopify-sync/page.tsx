import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"

type SyncedItem = {
  id: string
  title: string
  handle: string
  aedPrice: number
  imageCount: number
  variantCount: number
  thumbnail?: string | null
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

const ShopifySyncAdminPage = () => {
  const [statusInfo, setStatusInfo] = useState<StatusInfo | null>(null)
  const [batchLimit, setBatchLimit] = useState<number>(10)
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

  const runSync = async (limitToUse: number) => {
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
        body: JSON.stringify({ limit: limitToUse }),
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
    <div style={{ padding: "24px", maxWidth: "960px" }}>
      <div
        style={{
          background: "var(--bg-base, #ffffff)",
          border: "1px solid var(--border-base, #e5e7eb)",
          borderRadius: "8px",
          padding: "24px",
        }}
      >
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "var(--fg-base, #111827)",
            margin: 0,
          }}
        >
          Shopify Catalog Sync
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "var(--fg-subtle, #6b7280)",
            marginTop: "6px",
            lineHeight: 1.5,
          }}
        >
          Pulls published eveningwear directly from{" "}
          <strong>{statusInfo?.sourceDomain || "illusionline.com"}</strong>,
          cleans HTML descriptions into luxury plain text, uploads full-res
          imagery directly to your Railway S3 Bucket, and generates{" "}
          <code>Custom</code> Made-to-Measure variants priced in{" "}
          <strong>AED</strong>. Existing handles are skipped automatically.
        </p>

        {statusInfo && (
          <div
            style={{
              marginTop: "16px",
              display: "flex",
              gap: "24px",
              fontSize: "12px",
              color: "var(--fg-subtle, #6b7280)",
            }}
          >
            <span>
              Total Medusa Products:{" "}
              <strong style={{ color: "var(--fg-base, #111827)" }}>
                {statusInfo.totalMedusaProducts}
              </strong>
            </span>
            <span>
              Synced from Shopify:{" "}
              <strong style={{ color: "var(--fg-base, #111827)" }}>
                {statusInfo.syncedFromShopifyCount}
              </strong>
            </span>
          </div>
        )}

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={() => runSync(10)}
            disabled={isSyncing}
            style={{
              background: isSyncing ? "#6b7280" : "#111827",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: isSyncing ? "not-allowed" : "pointer",
            }}
          >
            {isSyncing
              ? "Syncing Dresses & Uploading to S3..."
              : "Sync 10 Dresses from Shopify"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label
              htmlFor="custom-sync-limit"
              style={{
                fontSize: "12px",
                color: "var(--fg-subtle, #6b7280)",
              }}
            >
              Custom batch size:
            </label>
            <input
              id="custom-sync-limit"
              type="number"
              min={1}
              max={50}
              value={batchLimit}
              onChange={(e) => setBatchLimit(Number(e.target.value) || 10)}
              style={{
                width: "68px",
                padding: "6px 8px",
                fontSize: "12px",
                borderRadius: "6px",
                border: "1px solid var(--border-base, #d1d5db)",
                background: "var(--bg-base, #ffffff)",
                color: "var(--fg-base, #111827)",
              }}
            />
            <button
              type="button"
              onClick={() => runSync(batchLimit)}
              disabled={isSyncing}
              style={{
                background: "transparent",
                color: "var(--fg-base, #111827)",
                border: "1px solid var(--border-base, #d1d5db)",
                borderRadius: "6px",
                padding: "7px 12px",
                fontSize: "12px",
                cursor: isSyncing ? "not-allowed" : "pointer",
              }}
            >
              Run Custom Batch
            </button>
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              borderRadius: "6px",
              background: "rgba(220, 38, 38, 0.08)",
              color: "#b91c1c",
              fontSize: "13px",
            }}
          >
            {errorMsg}
          </div>
        )}

        {result && (
          <div
            style={{
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid var(--border-base, #e5e7eb)",
              fontSize: "13px",
              color: "var(--fg-base, #111827)",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "12px" }}>
              Batch Summary: {result.importedCount ?? 0} imported ·{" "}
              {result.skippedCount ?? 0} existing skipped ·{" "}
              {result.errorCount ?? 0} errors
            </div>

            {result.imported && result.imported.length > 0 && (
              <div style={{ marginBottom: "14px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  Imported Dresses:
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "20px",
                    display: "grid",
                    gap: "6px",
                  }}
                >
                  {result.imported.map((item) => (
                    <li key={item.id}>
                      <strong>{item.title}</strong> — <code>{item.handle}</code>{" "}
                      <span style={{ color: "var(--fg-subtle, #6b7280)" }}>
                        (AED {item.aedPrice} · {item.imageCount} S3 images ·{" "}
                        {item.variantCount} variants)
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.skipped && result.skipped.length > 0 && (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--fg-subtle, #6b7280)",
                }}
              >
                Skipped existing handles:{" "}
                {result.skipped.map((s) => s.handle).join(", ")}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Shopify Catalog Sync",
})

export default ShopifySyncAdminPage
