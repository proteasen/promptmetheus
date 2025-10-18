import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    return Response.json({ user })
  } catch (error) {
    return Response.json({ user: null }, { status: 401 })
  }
}
