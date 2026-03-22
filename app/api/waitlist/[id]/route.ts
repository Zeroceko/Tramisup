import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendInviteEmail } from "@/lib/email"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@tiramisup"

function generateInviteCode(): string {
  // Generate 8-character random code (A-Z0-9)
  return Array.from({ length: 8 })
    .map(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)])
    .join("")
}

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

    // Get current entry to check if we need to generate invite code
    const existingEntry = await prisma.waitlist.findUnique({
      where: { id },
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Entry not found" },
        { status: 404 }
      )
    }

    // Generate invite code if approving/inviting and no code exists
    let updateData: any = { status }
    if ((status === "APPROVED" || status === "INVITED") && !existingEntry.inviteCode) {
      updateData.inviteCode = generateInviteCode()
    }

    const entry = await prisma.waitlist.update({
      where: { id },
      data: updateData,
    })

    // Send invite email if code was just generated
    if (updateData.inviteCode && entry.email) {
      await sendInviteEmail(entry.email, entry.name || null, updateData.inviteCode)
    }

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
