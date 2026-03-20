import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
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
