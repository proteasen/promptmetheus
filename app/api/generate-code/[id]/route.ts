import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete the project (verify ownership)
    await prisma.generatedCode.deleteMany({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
