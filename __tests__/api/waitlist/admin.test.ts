import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    waitlist: {
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

import { PATCH, DELETE } from '@/app/api/waitlist/[id]/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

const mockWaitlist = vi.mocked(prisma.waitlist)
const mockGetServerSession = vi.mocked(getServerSession)

function createPatchRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/waitlist/test-id', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function createDeleteRequest() {
  return new Request('http://localhost:3000/api/waitlist/test-id', {
    method: 'DELETE',
  })
}

const mockContext = { params: Promise.resolve({ id: 'test-id' }) }

function mockAdmin() {
  mockGetServerSession.mockResolvedValue({
    user: { email: 'admin@tiramisup', name: 'Admin', id: 'admin-id' },
    expires: '',
  })
}

function mockNonAdmin() {
  mockGetServerSession.mockResolvedValue({
    user: { email: 'user@example.com', name: 'User', id: 'user-id' },
    expires: '',
  })
}

function mockNoSession() {
  mockGetServerSession.mockResolvedValue(null)
}

describe('PATCH /api/waitlist/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAdmin()
  })

  it('should return 401 if not authenticated', async () => {
    mockNoSession()
    const request = createPatchRequest({ status: 'APPROVED' })
    const response = await PATCH(request, mockContext)

    expect(response.status).toBe(401)
  })

  it('should return 401 if not admin email', async () => {
    mockNonAdmin()
    const request = createPatchRequest({ status: 'APPROVED' })
    const response = await PATCH(request, mockContext)

    expect(response.status).toBe(401)
  })

  it('should return 400 for invalid status value', async () => {
    const request = createPatchRequest({ status: 'INVALID_STATUS' })
    const response = await PATCH(request, mockContext)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid status')
  })

  it('should update entry to APPROVED', async () => {
    mockWaitlist.update.mockResolvedValue({
      id: 'test-id',
      email: 'test@example.com',
      name: null,
      source: 'landing',
      status: 'APPROVED',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)

    const request = createPatchRequest({ status: 'APPROVED' })
    const response = await PATCH(request, mockContext)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('APPROVED')
    expect(mockWaitlist.update).toHaveBeenCalledWith({
      where: { id: 'test-id' },
      data: { status: 'APPROVED' },
    })
  })

  it('should update entry to REJECTED', async () => {
    mockWaitlist.update.mockResolvedValue({
      id: 'test-id',
      email: 'test@example.com',
      status: 'REJECTED',
    } as any)

    const request = createPatchRequest({ status: 'REJECTED' })
    const response = await PATCH(request, mockContext)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('REJECTED')
  })

  it('should accept all valid status values', async () => {
    for (const status of ['PENDING', 'APPROVED', 'REJECTED', 'INVITED']) {
      vi.clearAllMocks()
      mockAdmin()
      mockWaitlist.update.mockResolvedValue({
        id: 'test-id',
        status,
      } as any)

      const request = createPatchRequest({ status })
      const response = await PATCH(request, mockContext)

      expect(response.status).toBe(200)
    }
  })

  it('should return 500 on unexpected errors', async () => {
    mockWaitlist.update.mockRejectedValue(new Error('Record not found'))

    const request = createPatchRequest({ status: 'APPROVED' })
    const response = await PATCH(request, mockContext)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to update waitlist entry')
  })
})

describe('DELETE /api/waitlist/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAdmin()
  })

  it('should return 401 if not authenticated', async () => {
    mockNoSession()
    const request = createDeleteRequest()
    const response = await DELETE(request, mockContext)

    expect(response.status).toBe(401)
  })

  it('should return 401 if not admin email', async () => {
    mockNonAdmin()
    const request = createDeleteRequest()
    const response = await DELETE(request, mockContext)

    expect(response.status).toBe(401)
  })

  it('should delete entry successfully', async () => {
    mockWaitlist.delete.mockResolvedValue({
      id: 'test-id',
      email: 'test@example.com',
    } as any)

    const request = createDeleteRequest()
    const response = await DELETE(request, mockContext)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Waitlist entry deleted')
    expect(mockWaitlist.delete).toHaveBeenCalledWith({
      where: { id: 'test-id' },
    })
  })

  it('should return 500 if entry not found', async () => {
    mockWaitlist.delete.mockRejectedValue(new Error('Record not found'))

    const request = createDeleteRequest()
    const response = await DELETE(request, mockContext)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to delete waitlist entry')
  })

  it('should not leak error details in 500 response', async () => {
    mockWaitlist.delete.mockRejectedValue(new Error('Sensitive info: constraint violation'))

    const request = createDeleteRequest()
    const response = await DELETE(request, mockContext)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(JSON.stringify(data)).not.toContain('Sensitive')
    expect(JSON.stringify(data)).not.toContain('constraint')
  })
})
