export type NgeniusEnvironment = "live" | "sandbox" | string

export type NgeniusOptions = {
  apiKey?: string
  outletRef?: string
  env?: NgeniusEnvironment
  storefrontUrl?: string
  webhookSecret?: string
}

export type NgeniusTokenResponse = {
  access_token: string
  expires_in?: number
  token_type?: string
}

export type NgeniusLink = {
  href: string
}

export type NgeniusPaymentResource = {
  _id?: string
  reference?: string
  state?: string
  origin?: string
  amount?: {
    currencyCode: string
    value: number
  }
  paymentMethod?: {
    name?: string
    pan?: string
    cardholderName?: string
    expiry?: string
  }
  authResponse?: {
    authorizationCode?: string
    success?: boolean
    resultCode?: string
    resultMessage?: string
  }
  _links?: {
    self?: NgeniusLink
    "cnp:capture"?: NgeniusLink
    "cnp:refund"?: NgeniusLink
    "cnp:cancel"?: NgeniusLink
    [key: string]: NgeniusLink | undefined
  }
  _embedded?: {
    "cnp:capture"?: Array<{
      _id?: string
      state?: string
      amount?: { currencyCode: string; value: number }
      _links?: {
        self?: NgeniusLink
        "cnp:refund"?: NgeniusLink
      }
    }>
    "cnp:refund"?: Array<{
      _id?: string
      state?: string
      amount?: { currencyCode: string; value: number }
    }>
  }
}

export type NgeniusOrderResponse = {
  _id?: string
  reference: string
  action?: string
  amount?: {
    currencyCode: string
    value: number
  }
  merchantOrderReference?: string
  merchantDefinedData?: Record<string, string>
  emailAddress?: string
  _links?: {
    payment?: NgeniusLink
    "payment-authorization"?: NgeniusLink
    self?: NgeniusLink
    [key: string]: NgeniusLink | undefined
  }
  _embedded?: {
    payment?: NgeniusPaymentResource[]
  }
}

export type NgeniusWebhookPayload = {
  eventId?: string
  eventName?: string
  order?: NgeniusOrderResponse
}
