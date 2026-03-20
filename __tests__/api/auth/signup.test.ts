import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    product: {
      create: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
}))

vi.mock('@/lib/seed', () => ({
  seedProductData: vi.fn().mockResolvedValue(undefined),
}))

import { POST } from '@/app/api/auth/signup/route'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const mockPrismaUser    = vi.mocked(prisma.user)
const mockPrismaProduct = vi.mocked(prisma.product)
const mockBcrypt        = vi.mocked(bcrypt)

function createRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if email is missing', async () => {
    const request = createRequest({ password: 'password123' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email ve şifre zorunludur')
  })

  it('should return 400 if password is missing', async () => {
    const request = createRequest({ email: 'test@example.com' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email ve şifre zorunludur')
  })

  it('should return 400 if both email and password are missing', async () => {
    const request = createRequest({ name: 'Test' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email ve şifre zorunludur')
  })

  it('should return 400 if password is too short', async () => {
    const request = createRequest({ email: 'test@example.com', password: 'short' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Şifre en az 8 karakter olmalıdır')
  })

  it('should return 400 if user already exists', async () => {
    mockPrismaUser.findUnique.mockResolvedValue({
      id: 'existing-user',
      email: 'existing@example.com',
      name: 'Existing',
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)

    const request = createRequest({
      name: 'Test',
      email: 'existing@example.com',
      password: 'password123',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Bu e-posta adresi zaten kayıtlı')
  })

  it('should create user with hashed password and default product', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(null)
    mockBcrypt.hash.mockResolvedValue('$2a$10$hashed' as never)
    mockPrismaUser.create.mockResolvedValue({
      id: 'new-user-123',
      email: 'new@example.com',
      name: 'New User',
      passwordHash: '$2a$10$hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)
    mockPrismaProduct.create.mockResolvedValue({ id: 'product-123' } as any)

    const request = createRequest({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toBe('Hesap oluşturuldu')

    expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10)

    expect(mockPrismaUser.create).toHaveBeenCalledWith({
      data: {
        email: 'new@example.com',
        name: 'New User',
        passwordHash: '$2a$10$hashed',
      },
    })

    expect(mockPrismaProduct.create).toHaveBeenCalledWith({
      data: {
        userId: 'new-user-123',
        name: "Benim Startup'ım",
        status: 'PRE_LAUNCH',
      },
    })
  })

  it('should handle signup without name (falls back to email username)', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(null)
    mockBcrypt.hash.mockResolvedValue('$2a$10$hashed' as never)
    mockPrismaUser.create.mockResolvedValue({
      id: 'new-user-456',
      email: 'noname@example.com',
      name: 'noname',
      passwordHash: '$2a$10$hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)
    mockPrismaProduct.create.mockResolvedValue({ id: 'product-456' } as any)

    const request = createRequest({
      email: 'noname@example.com',
      password: 'password123',
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    // name falls back to the email username part
    expect(mockPrismaUser.create).toHaveBeenCalledWith({
      data: {
        email: 'noname@example.com',
        name: 'noname',
        passwordHash: '$2a$10$hashed',
      },
    })
  })

  it('should return 500 on unexpected errors', async () => {
    mockPrismaUser.findUnique.mockRejectedValue(new Error('DB connection failed'))

    const request = createRequest({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Sunucu hatası, lütfen tekrar deneyin')
  })

  it('should not leak error details in 500 response', async () => {
    mockPrismaUser.findUnique.mockRejectedValue(new Error('Sensitive DB info'))

    const request = createRequest({
      email: 'test@example.com',
      password: 'password123',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(JSON.stringify(data)).not.toContain('Sensitive')
    expect(JSON.stringify(data)).not.toContain('DB info')
  })
})
