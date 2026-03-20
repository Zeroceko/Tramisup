import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter required" },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const entry = await prisma.waitlist.findUnique({
      where: { email: cleanEmail },
      select: { email: true, status: true },
    })

    if (!entry) {
      return NextResponse.json(
        { email: cleanEmail, status: "NOT_FOUND" },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { email: cleanEmail, status: entry.status },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error in GET /api/waitlist/check:", error)
    return NextResponse.json(
      { error: "Failed to check waitlist status" },
      { status: 500 }
    )
  }
}
