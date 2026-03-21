import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const ADMIN_EMAIL = "admin@tiramisup"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return false
  }
  return true
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const { status } = await request.json()

    if (!["PENDING", "APPROVED", "REJECTED", "INVITED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const entry = await prisma.waitlist.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(entry, { status: 200 })
  } catch (error) {
    console.error("Error in PATCH /api/waitlist/[id]:", error)
    return NextResponse.json(
      { error: "Failed to update waitlist entry" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    await prisma.waitlist.delete({
      where: { id },
    })

    return NextResponse.json(
      { success: true, message: "Waitlist entry deleted" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error in DELETE /api/waitlist/[id]:", error)
    return NextResponse.json(
      { error: "Failed to delete waitlist entry" },
      { status: 500 }
    )
  }
}
