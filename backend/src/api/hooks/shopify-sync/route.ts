import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import crypto from "crypto"
import { runShopifyCatalogSync } from "../../../workflows/sync-shopify-products"

function verifySyncSecret(req: MedusaRequest): boolean {
  const expected = (
    process.env.SHOPIFY_SYNC_SECRET ||
    process.env.COOKIE_SECRET ||
    ""
  ).trim()

  if (!expected || expected === "supersecret") {
    return false
  }

  const querySecret =
    typeof req.query?.secret === "string" ? req.query.secret.trim() : ""
  const headerSecret =
    typeof req.headers["x-shopify-sync-secret"] === "string"
      ? req.headers["x-shopify-sync-secret"].trim()
      : ""
  const authHeader =
    typeof req.headers["authorization"] === "string"
      ? req.headers["authorization"].replace(/^Bearer\s+/i, "").trim()
      : ""
  const bodySecret =
    req.body && typeof (req.body as Record<string, unknown>).secret === "string"
      ? String((req.body as Record<string, unknown>).secret).trim()
      : ""

  const candidate = querySecret || headerSecret || bodySecret || authHeader
  if (!candidate) {
    return false
  }

  const expectedBuf = Buffer.from(expected, "utf8")
  const candidateBuf = Buffer.from(candidate, "utf8")
  if (expectedBuf.length !== candidateBuf.length) {
    return false
  }

  return crypto.timingSafeEqual(expectedBuf, candidateBuf)
}

async function handleHookSync(req: MedusaRequest, res: MedusaResponse) {
  if (!verifySyncSecret(req)) {
    res.status(401).json({
      success: false,
      message:
        "Unauthorized: provide a valid ?secret= matching SHOPIFY_SYNC_SECRET or COOKIE_SECRET.",
    })
    return
  }

  const body = (req.body || {}) as { limit?: number; domain?: string }
  const queryLimit = req.query?.limit ? Number(req.query.limit) : undefined
  const limit = body.limit ?? queryLimit ?? 10

  try {
    const result = await runShopifyCatalogSync(req.scope, {
      limit,
      domain: body.domain,
    })

    res.status(200).json({
      success: true,
      ...result,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    res.status(500).json({
      success: false,
      message,
    })
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  await handleHookSync(req, res)
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  await handleHookSync(req, res)
}
