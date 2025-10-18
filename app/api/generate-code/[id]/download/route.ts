import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { prisma } from "@/lib/db"
import { createZipFile } from "@/lib/code-generation"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the project
    const project = await prisma.generatedCode.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Parse the files
    const files = JSON.parse(project.code)

    // Create zip file
    const zipBuffer = await createZipFile(files)

    // Return the zip file
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${project.title.replace(/[^a-zA-Z0-9]/g, "-")}.zip"`,
      },
    })
  } catch (error) {
    console.error("Error downloading project:", error)
    return NextResponse.json({ error: "Failed to download project" }, { status: 500 })
  }
}
