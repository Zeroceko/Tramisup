import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(email: string): boolean {
  return emailRegex.test(email.trim().toLowerCase())
}

export async function POST(request: Request) {
  try {
    const { email, name, source = "landing" } = await request.json()

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Check if already in waitlist
    const existing = await prisma.waitlist.findUnique({
      where: { email: cleanEmail },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Email already in waitlist" },
        { status: 409 }
      )
    }

    // Create waitlist entry
    const entry = await prisma.waitlist.create({
      data: {
        email: cleanEmail,
        name: name || null,
        source,
        status: "PENDING",
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for joining the waitlist!",
        email: entry.email,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error in POST /api/waitlist/join:", error)
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 }
    )
  }
}
