"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="font-display text-3xl font-light tracking-wide text-[#0A0A0A] mb-3 text-center">
        Create Client Profile
      </h1>
      <p className="text-center text-xs leading-relaxed text-[#0A0A0A]/65 mb-6">
        Register with ILLUSIONLINE to manage bespoke commissions, saved delivery
        addresses, and private orders.
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="First name"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="text-center text-[#0A0A0A]/60 text-xs mt-6 leading-relaxed">
          By creating an account, you agree to ILLUSIONLINE&apos;s{" "}
          <LocalizedClientLink
            href="/client-care#concierge"
            className="underline text-[#0A0A0A]"
          >
            Client Terms &amp; Privacy
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          Create Account
        </SubmitButton>
      </form>
      <span className="text-center text-[#0A0A0A]/70 text-xs mt-6">
        Already registered?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline text-[#0A0A0A]"
        >
          Sign in
        </button>
        .
      </span>
    </div>
  )
}

export default Register
