import {
  AbstractPaymentProvider,
  BigNumber,
  MedusaError,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
import {
  NgeniusOptions,
  NgeniusOrderResponse,
  NgeniusPaymentResource,
  NgeniusTokenResponse,
  NgeniusWebhookPayload,
} from "./types"

type BaseProvider = AbstractPaymentProvider<NgeniusOptions>
type InitiatePaymentInput = Parameters<BaseProvider["initiatePayment"]>[0]
type InitiatePaymentOutput = Awaited<ReturnType<BaseProvider["initiatePayment"]>>
type UpdatePaymentInput = Parameters<BaseProvider["updatePayment"]>[0]
type UpdatePaymentOutput = Awaited<ReturnType<BaseProvider["updatePayment"]>>
type GetPaymentStatusInput = Parameters<BaseProvider["getPaymentStatus"]>[0]
type GetPaymentStatusOutput = Awaited<ReturnType<BaseProvider["getPaymentStatus"]>>
type AuthorizePaymentInput = Parameters<BaseProvider["authorizePayment"]>[0]
type AuthorizePaymentOutput = Awaited<ReturnType<BaseProvider["authorizePayment"]>>
type CapturePaymentInput = Parameters<BaseProvider["capturePayment"]>[0]
type CapturePaymentOutput = Awaited<ReturnType<BaseProvider["capturePayment"]>>
type RefundPaymentInput = Parameters<BaseProvider["refundPayment"]>[0]
type RefundPaymentOutput = Awaited<ReturnType<BaseProvider["refundPayment"]>>
type CancelPaymentInput = Parameters<BaseProvider["cancelPayment"]>[0]
type CancelPaymentOutput = Awaited<ReturnType<BaseProvider["cancelPayment"]>>
type DeletePaymentInput = Parameters<BaseProvider["deletePayment"]>[0]
type DeletePaymentOutput = Awaited<ReturnType<BaseProvider["deletePayment"]>>
type RetrievePaymentInput = Parameters<BaseProvider["retrievePayment"]>[0]
type RetrievePaymentOutput = Awaited<ReturnType<BaseProvider["retrievePayment"]>>
type WebhookPayloadInput = Parameters<BaseProvider["getWebhookActionAndData"]>[0]
type WebhookActionResult = Awaited<ReturnType<BaseProvider["getWebhookActionAndData"]>>
type Logger = {
  info: (msg: string) => void
  warn: (msg: string) => void
  error: (msg: string) => void
}

const NGENIUS_LIVE_BASE_URL = "https://api-gateway.ngenius-payments.com"
const NGENIUS_SANDBOX_BASE_URL =
  "https://api-gateway.sandbox.ngenius-payments.com"

const IDENTITY_CONTENT_TYPE = "application/vnd.ni-identity.v1+json"
const PAYMENT_CONTENT_TYPE = "application/vnd.ni-payment.v2+json"

// Cache access token for ~4 minutes (tokens expire in 300s)
const TOKEN_TTL_MS = 240 * 1000

type TokenCacheEntry = {
  accessToken: string
  expiresAt: number
  cacheKey: string
}

type RuntimeConfig = {
  apiKey: string
  outletRef: string
  baseUrl: string
  storefrontUrl: string
  webhookSecret?: string
}

/**
 * N-Genius requires merchantOrderReference to match /^[a-zA-Z0-9\-]{1,37}$/.
 * Medusa v2 IDs (e.g. payses_01J..., pay_col_01J...) contain underscores.
 */
export function toNgeniusMerchantRef(rawId: string): string {
  if (!rawId || typeof rawId !== "string") {
    return ""
  }

  const sanitized = rawId
    .trim()
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 37)
    .replace(/-+$/g, "")

  return /^[a-zA-Z0-9-]{1,37}$/.test(sanitized) ? sanitized : ""
}

/**
 * Restores sanitized N-Genius merchantOrderReference values (payses-..., pay-col-...)
 * back to original underscore Medusa session IDs when needed during webhook correlation.
 */
export function fromNgeniusMerchantRef(ref?: string | null): string | undefined {
  if (!ref || typeof ref !== "string") {
    return undefined
  }
  const trimmed = ref.trim()
  if (!trimmed) {
    return undefined
  }
  if (trimmed.startsWith("payses-")) {
    return `payses_${trimmed.slice("payses-".length)}`
  }
  if (trimmed.startsWith("pay-col-")) {
    return `pay_col_${trimmed.slice("pay-col-".length)}`
  }
  return trimmed
}

class NgeniusPaymentProviderService extends AbstractPaymentProvider<NgeniusOptions> {
  static identifier = "ngenius"

  protected readonly options_: NgeniusOptions
  protected readonly logger_?: Logger
  private tokenCache_: TokenCacheEntry | null = null

  /**
   * BUILD SAFETY RULE: Never throw during startup/build when env vars are unset.
   * Credentials are validated strictly inside runtime payment methods.
   */
  static validateOptions(_options: Record<string, unknown>): void {
    // Intentionally non-throwing at build/startup time
  }

  constructor(cradle: Record<string, unknown>, options: NgeniusOptions) {
    // @ts-ignore
    super(...arguments)
    this.options_ = options || {}
    this.logger_ = cradle?.logger as Logger | undefined
  }

  private getRuntimeConfig(): RuntimeConfig {
    const rawApiKey = (
      this.options_?.apiKey ||
      process.env.NGENIUS_API_KEY ||
      ""
    ).trim()
    const apiKey = rawApiKey.replace(/^Basic\s+/i, "").trim()

    const outletRef = (
      this.options_?.outletRef ||
      process.env.NGENIUS_OUTLET_REF ||
      ""
    ).trim()

    if (!apiKey || !outletRef) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Network International (N-Genius) credentials missing: set NGENIUS_API_KEY and NGENIUS_OUTLET_REF."
      )
    }

    const env = (
      this.options_?.env ||
      process.env.NGENIUS_ENV ||
      "sandbox"
    )
      .trim()
      .toLowerCase()

    const baseUrl =
      env === "live" || env === "production"
        ? NGENIUS_LIVE_BASE_URL
        : NGENIUS_SANDBOX_BASE_URL

    const storefrontUrl = (
      this.options_?.storefrontUrl ||
      process.env.STOREFRONT_URL ||
      "https://beta.illusionline.com"
    )
      .trim()
      .replace(/\/+$/, "")

    const webhookSecret = (
      this.options_?.webhookSecret ||
      process.env.NGENIUS_WEBHOOK_SECRET ||
      ""
    ).trim()

    return {
      apiKey,
      outletRef,
      baseUrl,
      storefrontUrl,
      webhookSecret: webhookSecret || undefined,
    }
  }

  /**
   * CRITICAL AMOUNT UNIT RULE:
   * Medusa v2 passes amount in MAJOR units (e.g. 2500 for AED 2,500.00).
   * N-Genius requires integer MINOR units (fils: 1 AED = 100 fils -> 250000).
   */
  private toFils(amount: InitiatePaymentInput["amount"]): number {
    const majorNumeric =
      typeof amount === "number" ? amount : new BigNumber(amount as any).numeric
    const fils = Math.round(Number(majorNumeric) * 100)
    if (!Number.isFinite(fils) || fils < 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid AED payment amount passed to N-Genius: ${String(amount)}`
      )
    }
    return fils
  }

  private fromFils(fils: number): number {
    if (!Number.isFinite(fils)) return 0
    return Number((fils / 100).toFixed(2))
  }

  private async getAccessToken(
    cfg: RuntimeConfig,
    forceRefresh = false
  ): Promise<string> {
    const cacheKey = `${cfg.baseUrl}:${cfg.outletRef}`
    const now = Date.now()

    if (
      !forceRefresh &&
      this.tokenCache_ &&
      this.tokenCache_.cacheKey === cacheKey &&
      this.tokenCache_.expiresAt > now
    ) {
      return this.tokenCache_.accessToken
    }

    const res = await fetch(`${cfg.baseUrl}/identity/auth/access-token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${cfg.apiKey}`,
        "Content-Type": IDENTITY_CONTENT_TYPE,
        Accept: IDENTITY_CONTENT_TYPE,
      },
      body: JSON.stringify({}),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => "")
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `N-Genius authentication failed (${res.status}): ${errText}`
      )
    }

    const tokenData = (await res.json()) as NgeniusTokenResponse
    if (!tokenData?.access_token) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "N-Genius authentication response did not include access_token."
      )
    }

    const ttlMs = tokenData.expires_in
      ? Math.max(30_000, Math.min((tokenData.expires_in - 60) * 1000, TOKEN_TTL_MS))
      : TOKEN_TTL_MS

    this.tokenCache_ = {
      accessToken: tokenData.access_token,
      expiresAt: now + ttlMs,
      cacheKey,
    }

    return tokenData.access_token
  }

  private async ngeniusFetch<T>(
    cfg: RuntimeConfig,
    url: string,
    init: RequestInit,
    retried = false
  ): Promise<T> {
    const token = await this.getAccessToken(cfg, retried)

    const response = await fetch(url, {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: `Bearer ${token}`,
        Accept: PAYMENT_CONTENT_TYPE,
      },
    })

    if (response.status === 401 && !retried) {
      this.tokenCache_ = null
      return this.ngeniusFetch<T>(cfg, url, init, true)
    }

    if (!response.ok) {
      const errBody = await response.text().catch(() => "")
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `N-Genius API error (${response.status}) on ${url}: ${errBody}`
      )
    }

    const text = await response.text()
    return (text ? JSON.parse(text) : {}) as T
  }

  public static toNgeniusMerchantRef(rawId: string): string {
    return toNgeniusMerchantRef(rawId)
  }

  public static fromNgeniusMerchantRef(ref?: string | null): string | undefined {
    return fromNgeniusMerchantRef(ref)
  }

  private cleanNonEmptyString(val: unknown): string | undefined {
    if (typeof val !== "string") return undefined
    const trimmed = val.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }

  private buildBillingAddress(
    data?: Record<string, unknown>,
    context?: InitiatePaymentInput["context"]
  ): Record<string, string> | undefined {
    const rawAddr =
      (data?.billing_address as Record<string, unknown> | undefined) ||
      (context?.customer?.billing_address as Record<string, unknown> | undefined)

    if (!rawAddr || typeof rawAddr !== "object") {
      return undefined
    }

    const firstName =
      this.cleanNonEmptyString(rawAddr.first_name) ||
      this.cleanNonEmptyString(rawAddr.firstName) ||
      this.cleanNonEmptyString(context?.customer?.first_name)

    const lastName =
      this.cleanNonEmptyString(rawAddr.last_name) ||
      this.cleanNonEmptyString(rawAddr.lastName) ||
      this.cleanNonEmptyString(context?.customer?.last_name)

    const address1 =
      this.cleanNonEmptyString(rawAddr.address_1) ||
      this.cleanNonEmptyString(rawAddr.address1)

    const address2 =
      this.cleanNonEmptyString(rawAddr.address_2) ||
      this.cleanNonEmptyString(rawAddr.address2)

    const city = this.cleanNonEmptyString(rawAddr.city)

    const state =
      this.cleanNonEmptyString(rawAddr.province) ||
      this.cleanNonEmptyString(rawAddr.state)

    const postalCode =
      this.cleanNonEmptyString(rawAddr.postal_code) ||
      this.cleanNonEmptyString(rawAddr.postalCode)

    const rawCountry =
      this.cleanNonEmptyString(rawAddr.country_code) ||
      this.cleanNonEmptyString(rawAddr.countryCode)
    const countryCode = rawCountry ? rawCountry.toUpperCase() : undefined
    const validCountryCode =
      countryCode && /^[A-Z]{2,3}$/.test(countryCode) ? countryCode : undefined

    // Only include billingAddress when required core fields are present and valid
    if (!firstName || !lastName || !address1 || !city || !validCountryCode) {
      return undefined
    }

    const billing: Record<string, string> = {
      firstName,
      lastName,
      address1,
      city,
      countryCode: validCountryCode,
    }

    if (address2) billing.address2 = address2
    if (state) billing.state = state
    if (postalCode) billing.postalCode = postalCode

    return billing
  }

  private async createNgeniusOrder({
    cfg,
    amountInFils,
    data,
    context,
  }: {
    cfg: RuntimeConfig
    amountInFils: number
    data?: Record<string, unknown>
    context?: InitiatePaymentInput["context"]
  }): Promise<NgeniusOrderResponse> {
    const sessionId = this.cleanNonEmptyString(data?.session_id)
    const merchantOrderReference = sessionId
      ? NgeniusPaymentProviderService.toNgeniusMerchantRef(sessionId)
      : ""

    const rawEmail =
      this.cleanNonEmptyString(data?.email) ||
      this.cleanNonEmptyString(context?.customer?.email)
    const emailAddress =
      rawEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)
        ? rawEmail
        : undefined

    const billingAddress = this.buildBillingAddress(data, context)

    const redirectUrl = `${cfg.storefrontUrl}/api/ngenius/callback`
    const cancelUrl = `${cfg.storefrontUrl}/api/ngenius/callback?cancelled=1`

    const orderPayload: Record<string, unknown> = {
      action: "SALE",
      amount: {
        currencyCode: "AED",
        value: amountInFils,
      },
      merchantAttributes: {
        redirectUrl,
        cancelUrl,
        skipConfirmationPage: true,
      },
      ...(merchantOrderReference ? { merchantOrderReference } : {}),
      ...(sessionId ? { merchantDefinedData: { session_id: sessionId } } : {}),
      ...(emailAddress ? { emailAddress } : {}),
      ...(billingAddress ? { billingAddress } : {}),
    }

    return this.ngeniusFetch<NgeniusOrderResponse>(
      cfg,
      `${cfg.baseUrl}/transactions/outlets/${cfg.outletRef}/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": PAYMENT_CONTENT_TYPE,
        },
        body: JSON.stringify(orderPayload),
      }
    )
  }

  private selectRelevantPayment(
    order: NgeniusOrderResponse
  ): NgeniusPaymentResource | undefined {
    const payments = order?._embedded?.payment
    if (!Array.isArray(payments) || payments.length === 0) {
      return undefined
    }

    // Prefer a captured/purchased or authorised payment if multiple attempts exist
    const captured = payments.find(
      (p) => p?.state === "CAPTURED" || p?.state === "PURCHASED"
    )
    if (captured) return captured

    const authorised = payments.find(
      (p) => p?.state === "AUTHORISED" || p?.state === "AUTHORIZED"
    )
    if (authorised) return authorised

    // Otherwise inspect the most recent attempt (or payments[0])
    return payments[payments.length - 1] || payments[0]
  }

  private extractCaptureRefundLink(
    payment?: NgeniusPaymentResource
  ): string | undefined {
    if (payment?._links?.["cnp:refund"]?.href) {
      return payment._links["cnp:refund"].href
    }
    const captures = payment?._embedded?.["cnp:capture"]
    if (Array.isArray(captures) && captures.length > 0) {
      const capWithRefund = captures.find(
        (c) => c?._links?.["cnp:refund"]?.href
      )
      if (capWithRefund?._links?.["cnp:refund"]?.href) {
        return capWithRefund._links["cnp:refund"].href
      }
    }
    return undefined
  }

  private mapOrderToStatusOutput(
    order: NgeniusOrderResponse,
    existingData?: Record<string, unknown>
  ): { status: PaymentSessionStatus; data: Record<string, unknown> } {
    const payment = this.selectRelevantPayment(order)
    const rawState = (payment?.state || "STARTED").toUpperCase()

    let status: PaymentSessionStatus
    switch (rawState) {
      case "CAPTURED":
      case "PURCHASED":
        status = PaymentSessionStatus.CAPTURED
        break
      case "AUTHORISED":
      case "AUTHORIZED":
      case "PARTIALLY_CAPTURED":
        status = PaymentSessionStatus.AUTHORIZED
        break
      case "FAILED":
      case "DECLINED":
      case "AUTHORISATION_FAILED":
      case "PURCHASE_FAILED":
        status = PaymentSessionStatus.ERROR
        break
      case "CANCELLED":
      case "CANCELED":
        status = PaymentSessionStatus.CANCELED
        break
      case "STARTED":
      case "AWAIT_3DS":
      case "AWAIT_PARTIAL_AUTH_APPROVAL":
      default:
        status = PaymentSessionStatus.PENDING
        break
    }

    const paymentSummary = payment
      ? {
          paymentReference: payment.reference || payment._id,
          state: payment.state,
          origin: payment.origin,
          scheme: payment.paymentMethod?.name,
          maskedPan: payment.paymentMethod?.pan,
          cardholderName: payment.paymentMethod?.cardholderName,
          authCode: payment.authResponse?.authorizationCode,
          resultMessage: payment.authResponse?.resultMessage,
        }
      : undefined

    const captureHref = payment?._links?.["cnp:capture"]?.href
    const refundHref = this.extractCaptureRefundLink(payment)
    const cancelHref = payment?._links?.["cnp:cancel"]?.href

    return {
      status,
      data: {
        ...(existingData || {}),
        id: order.reference,
        ngeniusOrderRef: order.reference,
        paymentUrl:
          order._links?.payment?.href ||
          (existingData?.paymentUrl as string | undefined),
        amountInFils:
          order.amount?.value ?? (existingData?.amountInFils as number | undefined),
        currencyCode: "AED",
        ngeniusState: rawState,
        ...(paymentSummary ? { paymentSummary } : {}),
        _ngeniusLinks: {
          ...(captureHref ? { capture: captureHref } : {}),
          ...(refundHref ? { refund: refundHref } : {}),
          ...(cancelHref ? { cancel: cancelHref } : {}),
        },
      },
    }
  }

  async initiatePayment({
    amount,
    data,
    context,
  }: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const cfg = this.getRuntimeConfig()
    const amountInFils = this.toFils(amount)

    const order = await this.createNgeniusOrder({
      cfg,
      amountInFils,
      data,
      context,
    })

    const paymentUrl = order._links?.payment?.href
    if (!order.reference || !paymentUrl) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "N-Genius order response did not include reference or Hosted Payment Page _links.payment.href."
      )
    }

    return {
      id: order.reference,
      status: PaymentSessionStatus.PENDING,
      data: {
        ...(data || {}),
        id: order.reference,
        session_id: data?.session_id,
        ngeniusOrderRef: order.reference,
        paymentUrl,
        amountInFils,
        currencyCode: "AED",
        ngeniusState: "STARTED",
      },
    }
  }

  async updatePayment({
    data,
    amount,
    context,
  }: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const cfg = this.getRuntimeConfig()
    const nextAmountInFils = this.toFils(amount)

    const currentAmountInFils = Number(data?.amountInFils)
    const existingRef = data?.ngeniusOrderRef as string | undefined
    const existingUrl = data?.paymentUrl as string | undefined
    const existingState = String(data?.ngeniusState || "STARTED").toUpperCase()

    // Reuse existing session if amount hasn't changed and session is still fresh
    if (
      existingRef &&
      existingUrl &&
      currentAmountInFils === nextAmountInFils &&
      (existingState === "STARTED" || existingState === "AWAIT_3DS")
    ) {
      return {
        status: PaymentSessionStatus.PENDING,
        data: {
          ...(data || {}),
        },
      }
    }

    const freshOrder = await this.createNgeniusOrder({
      cfg,
      amountInFils: nextAmountInFils,
      data,
      context,
    })

    return {
      status: PaymentSessionStatus.PENDING,
      data: {
        ...(data || {}),
        id: freshOrder.reference,
        ngeniusOrderRef: freshOrder.reference,
        paymentUrl: freshOrder._links?.payment?.href,
        amountInFils: nextAmountInFils,
        currencyCode: "AED",
        ngeniusState: "STARTED",
      },
    }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const cfg = this.getRuntimeConfig()
    const ngeniusOrderRef = String(
      input?.data?.ngeniusOrderRef || input?.data?.id || ""
    ).trim()

    if (!ngeniusOrderRef) {
      return {
        status: PaymentSessionStatus.PENDING,
        data: input?.data || {},
      }
    }

    const order = await this.ngeniusFetch<NgeniusOrderResponse>(
      cfg,
      `${cfg.baseUrl}/transactions/outlets/${cfg.outletRef}/orders/${encodeURIComponent(
        ngeniusOrderRef
      )}`,
      {
        method: "GET",
      }
    )

    return this.mapOrderToStatusOutput(order, input?.data)
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    return this.getPaymentStatus(input)
  }

  async capturePayment({
    data,
  }: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const cfg = this.getRuntimeConfig()
    const ngeniusOrderRef = String(
      data?.ngeniusOrderRef || data?.id || ""
    ).trim()

    if (!ngeniusOrderRef) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Missing ngeniusOrderRef when capturing payment."
      )
    }

    const order = await this.ngeniusFetch<NgeniusOrderResponse>(
      cfg,
      `${cfg.baseUrl}/transactions/outlets/${cfg.outletRef}/orders/${encodeURIComponent(
        ngeniusOrderRef
      )}`,
      { method: "GET" }
    )

    const mapped = this.mapOrderToStatusOutput(order, data)
    if (mapped.status === PaymentSessionStatus.CAPTURED) {
      // Already captured via SALE action
      return { data: mapped.data }
    }

    const payment = this.selectRelevantPayment(order)
    const captureHref =
      payment?._links?.["cnp:capture"]?.href ||
      (mapped.data._ngeniusLinks as Record<string, string> | undefined)?.capture

    if (!captureHref) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `N-Genius order ${ngeniusOrderRef} cannot be captured in state ${mapped.data.ngeniusState}.`
      )
    }

    const amountInFils =
      Number(order.amount?.value || data?.amountInFils || 0)

    const captureRes = await this.ngeniusFetch<Record<string, unknown>>(
      cfg,
      captureHref,
      {
        method: "POST",
        headers: {
          "Content-Type": PAYMENT_CONTENT_TYPE,
        },
        body: JSON.stringify({
          amount: {
            currencyCode: "AED",
            value: amountInFils,
          },
        }),
      }
    )

    return {
      data: {
        ...mapped.data,
        ngeniusState: "CAPTURED",
        captureResponse: captureRes,
      },
    }
  }

  async refundPayment({
    amount,
    data,
  }: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const cfg = this.getRuntimeConfig()
    const refundFils = this.toFils(amount)
    const ngeniusOrderRef = String(
      data?.ngeniusOrderRef || data?.id || ""
    ).trim()

    if (!ngeniusOrderRef) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Missing ngeniusOrderRef when refunding payment."
      )
    }

    // Retrieve latest order so we always have the authoritative cnp:refund link
    const order = await this.ngeniusFetch<NgeniusOrderResponse>(
      cfg,
      `${cfg.baseUrl}/transactions/outlets/${cfg.outletRef}/orders/${encodeURIComponent(
        ngeniusOrderRef
      )}`,
      { method: "GET" }
    )

    const payment = this.selectRelevantPayment(order)
    const rawPaymentRef =
      payment?.reference ||
      payment?._id ||
      (
        (data?.paymentSummary as Record<string, unknown> | undefined)
          ?.paymentReference as string | undefined
      ) ||
      ""
    const cleanPaymentRef = String(rawPaymentRef)
      .trim()
      .replace(/^urn:payment:/i, "")

    const directFallbackRefundHref = cleanPaymentRef
      ? `${cfg.baseUrl}/transactions/outlets/${
          cfg.outletRef
        }/orders/${encodeURIComponent(
          ngeniusOrderRef
        )}/payments/${encodeURIComponent(cleanPaymentRef)}/refund`
      : undefined

    const refundHref =
      this.extractCaptureRefundLink(payment) ||
      (data?._ngeniusLinks as Record<string, string> | undefined)?.refund ||
      directFallbackRefundHref

    if (!refundHref) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `No N-Genius refund link or paymentReference available for order ${ngeniusOrderRef}.`
      )
    }

    const refundRes = await this.ngeniusFetch<Record<string, unknown>>(
      cfg,
      refundHref,
      {
        method: "POST",
        headers: {
          "Content-Type": PAYMENT_CONTENT_TYPE,
        },
        body: JSON.stringify({
          amount: {
            currencyCode: "AED",
            value: refundFils,
          },
        }),
      }
    )

    return {
      data: {
        ...(data || {}),
        lastRefund: refundRes,
      },
    }
  }

  async cancelPayment({
    data,
  }: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const ngeniusOrderRef = String(
      data?.ngeniusOrderRef || data?.id || ""
    ).trim()

    if (!ngeniusOrderRef) {
      return { data: data || {} }
    }

    try {
      const cfg = this.getRuntimeConfig()
      const order = await this.ngeniusFetch<NgeniusOrderResponse>(
        cfg,
        `${cfg.baseUrl}/transactions/outlets/${cfg.outletRef}/orders/${encodeURIComponent(
          ngeniusOrderRef
        )}`,
        { method: "GET" }
      )

      const payment = this.selectRelevantPayment(order)
      const cancelHref = payment?._links?.["cnp:cancel"]?.href

      if (cancelHref) {
        await this.ngeniusFetch<Record<string, unknown>>(cfg, cancelHref, {
          method: "PUT",
        })
      }

      return {
        data: {
          ...(data || {}),
          ngeniusState: "CANCELLED",
        },
      }
    } catch (err) {
      this.logger_?.warn(
        `N-Genius cancelPayment non-fatal warning for ${ngeniusOrderRef}: ${
          err instanceof Error ? err.message : String(err)
        }`
      )
      return { data: data || {} }
    }
  }

  async deletePayment(
    input: DeletePaymentInput
  ): Promise<DeletePaymentOutput> {
    return this.cancelPayment(input)
  }

  async retrievePayment({
    data,
  }: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const ngeniusOrderRef = String(
      data?.ngeniusOrderRef || data?.id || ""
    ).trim()

    if (!ngeniusOrderRef) {
      return { data: data || {} }
    }

    const cfg = this.getRuntimeConfig()
    const order = await this.ngeniusFetch<NgeniusOrderResponse>(
      cfg,
      `${cfg.baseUrl}/transactions/outlets/${cfg.outletRef}/orders/${encodeURIComponent(
        ngeniusOrderRef
      )}`,
      { method: "GET" }
    )

    return {
      data: order as unknown as Record<string, unknown>,
    }
  }

  async getWebhookActionAndData(
    webhookData: WebhookPayloadInput
  ): Promise<WebhookActionResult> {
    try {
      const configuredSecret = (
        this.options_?.webhookSecret ||
        process.env.NGENIUS_WEBHOOK_SECRET ||
        ""
      ).trim()

      if (configuredSecret && webhookData?.headers) {
        const incomingSecret =
          webhookData.headers["x-ngenius-webhook-secret"] ||
          webhookData.headers["x-webhook-secret"] ||
          webhookData.headers["authorization"]
        if (
          incomingSecret &&
          incomingSecret !== configuredSecret &&
          incomingSecret !== `Bearer ${configuredSecret}`
        ) {
          this.logger_?.warn("N-Genius webhook secret mismatch.")
          return { action: PaymentActions.NOT_SUPPORTED }
        }
      }

      const rawPayload =
        webhookData?.data && Object.keys(webhookData.data).length > 0
          ? (webhookData.data as unknown as NgeniusWebhookPayload)
          : typeof webhookData?.rawData === "string"
          ? (JSON.parse(webhookData.rawData) as NgeniusWebhookPayload)
          : Buffer.isBuffer(webhookData?.rawData)
          ? (JSON.parse(
              webhookData.rawData.toString("utf8")
            ) as NgeniusWebhookPayload)
          : undefined

      const order = rawPayload?.order
      if (!order) {
        return { action: PaymentActions.NOT_SUPPORTED }
      }

      const definedSessionId = this.cleanNonEmptyString(
        order.merchantDefinedData?.session_id
      )
      const sessionId =
        definedSessionId ||
        NgeniusPaymentProviderService.fromNgeniusMerchantRef(
          order.merchantOrderReference
        )

      if (!sessionId) {
        return { action: PaymentActions.NOT_SUPPORTED }
      }

      const payment = this.selectRelevantPayment(order)
      const fils =
        payment?.amount?.value ?? order.amount?.value ?? 0
      const amountMajor = this.fromFils(fils)

      const eventName = (rawPayload?.eventName || "").toUpperCase()
      const paymentState = (payment?.state || "").toUpperCase()

      if (
        paymentState === "CAPTURED" ||
        paymentState === "PURCHASED" ||
        eventName === "CAPTURED" ||
        eventName === "PURCHASED"
      ) {
        return {
          action: PaymentActions.SUCCESSFUL,
          data: {
            session_id: sessionId,
            amount: amountMajor,
          },
        }
      }

      if (paymentState === "AUTHORISED" || eventName === "AUTHORISED") {
        return {
          action: PaymentActions.AUTHORIZED,
          data: {
            session_id: sessionId,
            amount: amountMajor,
          },
        }
      }

      if (
        paymentState === "FAILED" ||
        paymentState === "DECLINED" ||
        eventName.includes("FAILED") ||
        eventName.includes("DECLINED")
      ) {
        return {
          action: PaymentActions.FAILED,
          data: {
            session_id: sessionId,
            amount: amountMajor,
          },
        }
      }

      if (paymentState === "CANCELLED" || eventName.includes("CANCEL")) {
        return {
          action: PaymentActions.CANCELED,
          data: {
            session_id: sessionId,
            amount: amountMajor,
          },
        }
      }

      return {
        action: PaymentActions.PENDING,
        data: {
          session_id: sessionId,
          amount: amountMajor,
        },
      }
    } catch (err) {
      this.logger_?.error(
        `Error processing N-Genius webhook: ${
          err instanceof Error ? err.message : String(err)
        }`
      )
      return { action: PaymentActions.NOT_SUPPORTED }
    }
  }
}

export default NgeniusPaymentProviderService
