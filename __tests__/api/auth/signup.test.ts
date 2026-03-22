import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    waitlist: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
}))

import { POST } from '@/app/api/auth/signup/route'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const mockPrismaUser = vi.mocked(prisma.user)
const mockPrismaWaitlist = vi.mocked(prisma.waitlist)
const mockBcrypt     = vi.mocked(bcrypt)

const VALID_ACCESS_CODE = 'TT31623SEN'

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
    // By default, waitlist lookup returns null (no DB code found)
    mockPrismaWaitlist.findFirst.mockResolvedValue(null)
  })

  it('should return 400 if email is missing', async () => {
    const request = createRequest({ password: 'password123', accessCode: VALID_ACCESS_CODE })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email ve şifre zorunludur')
  })

  it('should return 400 if password is missing', async () => {
    const request = createRequest({ email: 'test@example.com', accessCode: VALID_ACCESS_CODE })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email ve şifre zorunludur')
  })

  it('should return 400 if both email and password are missing', async () => {
    const request = createRequest({ name: 'Test', accessCode: VALID_ACCESS_CODE })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email ve şifre zorunludur')
  })

  it('should return 400 if password is too short', async () => {
    const request = createRequest({ email: 'test@example.com', password: 'short', accessCode: VALID_ACCESS_CODE })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Şifre en az 8 karakter olmalıdır')
  })

  it('should return 400 if access code is missing', async () => {
    const request = createRequest({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Erken erişim kodu gereklidir')
  })

  it('should return 400 if access code is invalid', async () => {
    const request = createRequest({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
      accessCode: 'WRONGCODE',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Geçersiz erken erişim kodu')
  })

  it('should accept access code case-insensitively', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(null)
    mockBcrypt.hash.mockResolvedValue('$2a$10$hashed' as never)
    mockPrismaUser.create.mockResolvedValue({
      id: 'new-user-123',
      email: 'case@example.com',
      name: 'Case Test',
      passwordHash: '$2a$10$hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)

    const request = createRequest({
      name: 'Case Test',
      email: 'case@example.com',
      password: 'password123',
      accessCode: 'tt31623sen',
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
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
      accessCode: VALID_ACCESS_CODE,
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Bu e-posta adresi zaten kayıtlı')
  })

  it('should create user with hashed password (no product creation)', async () => {
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

    const request = createRequest({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
      accessCode: VALID_ACCESS_CODE,
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toBe('Hesap oluşturuldu')
    expect(data.userId).toBe('new-user-123')

    expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10)

    expect(mockPrismaUser.create).toHaveBeenCalledWith({
      data: {
        email: 'new@example.com',
        name: 'New User',
        passwordHash: '$2a$10$hashed',
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

    const request = createRequest({
      email: 'noname@example.com',
      password: 'password123',
      accessCode: VALID_ACCESS_CODE,
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
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
      accessCode: VALID_ACCESS_CODE,
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
      accessCode: VALID_ACCESS_CODE,
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(JSON.stringify(data)).not.toContain('Sensitive')
    expect(JSON.stringify(data)).not.toContain('DB info')
  })
})
