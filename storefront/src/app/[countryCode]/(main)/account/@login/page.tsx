import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Client Sign In",
  description: "Sign in to your ILLUSIONLINE client account.",
}

export default function Login() {
  return <LoginTemplate />
}
