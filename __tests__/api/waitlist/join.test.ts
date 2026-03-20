import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    waitlist: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

import { POST } from '@/app/api/waitlist/join/route'
import { prisma } from '@/lib/prisma'

const mockWaitlist = vi.mocked(prisma.waitlist)

function createRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/waitlist/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/waitlist/join', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if email is missing', async () => {
    const request = createRequest({ name: 'Test' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email is required')
  })

  it('should return 400 if email is empty string', async () => {
    const request = createRequest({ email: '' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email is required')
  })

  it('should return 400 if email is not a string', async () => {
    const request = createRequest({ email: 123 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email is required')
  })

  it('should return 400 for invalid email format', async () => {
    const request = createRequest({ email: 'not-an-email' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid email format')
  })

  it('should return 400 for email without domain', async () => {
    const request = createRequest({ email: 'user@' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid email format')
  })

  it('should return 409 if email already in waitlist', async () => {
    mockWaitlist.findUnique.mockResolvedValue({
      id: 'existing-id',
      email: 'existing@example.com',
      name: null,
      source: 'landing',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)

    const request = createRequest({ email: 'existing@example.com' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('Email already in waitlist')
  })

  it('should create waitlist entry successfully', async () => {
    mockWaitlist.findUnique.mockResolvedValue(null)
    mockWaitlist.create.mockResolvedValue({
      id: 'new-id',
      email: 'new@example.com',
      name: 'Test User',
      source: 'landing',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)

    const request = createRequest({
      email: 'New@Example.com',
      name: 'Test User',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.email).toBe('new@example.com')

    expect(mockWaitlist.create).toHaveBeenCalledWith({
      data: {
        email: 'new@example.com',
        name: 'Test User',
        source: 'landing',
        status: 'PENDING',
      },
    })
  })

  it('should normalize email to lowercase and trim whitespace', async () => {
    mockWaitlist.findUnique.mockResolvedValue(null)
    mockWaitlist.create.mockResolvedValue({
      id: 'new-id',
      email: 'test@example.com',
      name: null,
      source: 'landing',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)

    const request = createRequest({ email: '  TEST@Example.COM  ' })
    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(mockWaitlist.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    })
  })

  it('should use custom source when provided', async () => {
    mockWaitlist.findUnique.mockResolvedValue(null)
    mockWaitlist.create.mockResolvedValue({
      id: 'new-id',
      email: 'test@example.com',
      name: null,
      source: 'referral',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)

    const request = createRequest({
      email: 'test@example.com',
      source: 'referral',
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(mockWaitlist.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ source: 'referral' }),
    })
  })

  it('should handle name as null when not provided', async () => {
    mockWaitlist.findUnique.mockResolvedValue(null)
    mockWaitlist.create.mockResolvedValue({
      id: 'new-id',
      email: 'test@example.com',
      name: null,
      source: 'landing',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)

    const request = createRequest({ email: 'test@example.com' })
    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(mockWaitlist.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ name: null }),
    })
  })

  it('should return 500 on unexpected errors', async () => {
    mockWaitlist.findUnique.mockRejectedValue(new Error('DB connection failed'))

    const request = createRequest({ email: 'test@example.com' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to join waitlist')
  })

  it('should not leak error details in 500 response', async () => {
    mockWaitlist.findUnique.mockRejectedValue(new Error('Sensitive DB credentials'))

    const request = createRequest({ email: 'test@example.com' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(JSON.stringify(data)).not.toContain('Sensitive')
    expect(JSON.stringify(data)).not.toContain('credentials')
  })
})
