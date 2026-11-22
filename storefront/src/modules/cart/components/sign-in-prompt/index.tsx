import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-transparent flex items-center justify-between gap-4 py-2">
      <div>
        <h2 className="font-display text-xl text-[#0A0A0A]">
          ILLUSIONLINE Client Account
        </h2>
        <p className="text-xs text-[#0A0A0A]/60 mt-1">
          Sign in to access saved addresses and bespoke order history.
        </p>
      </div>
      <div>
        <LocalizedClientLink
          href="/account"
          data-testid="sign-in-button"
          className="inline-flex items-center justify-center px-5 h-10 border border-[#0A0A0A]/25 text-[11px] uppercase tracking-[0.2em] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#FAF9F6] transition-colors duration-300 whitespace-nowrap"
        >
          Sign In
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
