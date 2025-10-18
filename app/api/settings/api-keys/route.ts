import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { prisma } from "@/lib/db"
import { encrypt } from "@/lib/encryption"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { provider, apiKey } = await request.json()

    if (!provider || !apiKey) {
      return NextResponse.json({ error: "Provider and API key are required" }, { status: 400 })
    }

    // Encrypt the API key
    const encryptedKey = encrypt(apiKey)

    // Create or update the API key
    const savedKey = await prisma.apiKey.upsert({
      where: {
        userId_provider: {
          userId: user.id,
          provider,
        },
      },
      update: {
        keyHash: encryptedKey,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        provider,
        keyHash: encryptedKey,
      },
      select: {
        id: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(savedKey)
  } catch (error) {
    console.error("Error saving API key:", error)
    return NextResponse.json({ error: "Failed to save API key" }, { status: 500 })
  }
}
