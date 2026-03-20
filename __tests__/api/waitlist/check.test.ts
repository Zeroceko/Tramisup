import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    waitlist: {
      findUnique: vi.fn(),
    },
  },
}))

import { GET } from '@/app/api/waitlist/check/route'
import { prisma } from '@/lib/prisma'

const mockWaitlist = vi.mocked(prisma.waitlist)

function createRequest(email?: string) {
  const url = email
    ? `http://localhost:3000/api/waitlist/check?email=${encodeURIComponent(email)}`
    : 'http://localhost:3000/api/waitlist/check'
  return new Request(url)
}

describe('GET /api/waitlist/check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if email parameter is missing', async () => {
    const request = createRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email parameter required')
  })

  it('should return NOT_FOUND for unknown email', async () => {
    mockWaitlist.findUnique.mockResolvedValue(null)

    const request = createRequest('unknown@example.com')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('NOT_FOUND')
    expect(data.email).toBe('unknown@example.com')
  })

  it('should return PENDING for pending email', async () => {
    mockWaitlist.findUnique.mockResolvedValue({
      email: 'pending@example.com',
      status: 'PENDING',
    } as any)

    const request = createRequest('pending@example.com')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('PENDING')
    expect(data.email).toBe('pending@example.com')
  })

  it('should return APPROVED for approved email', async () => {
    mockWaitlist.findUnique.mockResolvedValue({
      email: 'approved@example.com',
      status: 'APPROVED',
    } as any)

    const request = createRequest('approved@example.com')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('APPROVED')
  })

  it('should normalize email to lowercase', async () => {
    mockWaitlist.findUnique.mockResolvedValue(null)

    const request = createRequest('TEST@Example.COM')
    await GET(request)

    expect(mockWaitlist.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      select: { email: true, status: true },
    })
  })

  it('should return 500 on unexpected errors', async () => {
    mockWaitlist.findUnique.mockRejectedValue(new Error('DB error'))

    const request = createRequest('test@example.com')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to check waitlist status')
  })

  it('should not leak error details in 500 response', async () => {
    mockWaitlist.findUnique.mockRejectedValue(new Error('Secret DB info'))

    const request = createRequest('test@example.com')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(JSON.stringify(data)).not.toContain('Secret')
  })
})
