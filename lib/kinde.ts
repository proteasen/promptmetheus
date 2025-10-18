import { createKindeServerClient, GrantType } from "@kinde-oss/kinde-auth-nextjs/server"
import type { NextRequest } from "next/server"

export const kindeClient = createKindeServerClient(GrantType.AUTHORIZATION_CODE, {
  authDomain: process.env.KINDE_ISSUER_URL!,
  clientId: process.env.KINDE_CLIENT_ID!,
  clientSecret: process.env.KINDE_CLIENT_SECRET!,
  redirectURL: process.env.KINDE_SITE_URL! + "/api/auth/callback",
  logoutRedirectURL: process.env.KINDE_POST_LOGOUT_REDIRECT_URL!,
})

export async function getKindeServerSession(request: NextRequest) {
  return await kindeClient.getUser(request)
}
