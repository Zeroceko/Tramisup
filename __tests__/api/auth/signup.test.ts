import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    project: {
      create: vi.fn(),
    },
  },
}))

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
}))

import { POST } from '@/app/api/auth/signup/route'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const mockPrismaUser = vi.mocked(prisma.user)
const mockPrismaProject = vi.mocked(prisma.project)
const mockBcrypt = vi.mocked(bcrypt)

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
    expect(data.error).toBe('Email and password are required')
  })

  it('should return 400 if password is missing', async () => {
    const request = createRequest({ email: 'test@example.com' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email and password are required')
  })

  it('should return 400 if both email and password are missing', async () => {
    const request = createRequest({ name: 'Test' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email and password are required')
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
    expect(data.error).toBe('User with this email already exists')
  })

  it('should create user with hashed password and default project', async () => {
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
    mockPrismaProject.create.mockResolvedValue({} as any)

    const request = createRequest({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toBe('User created successfully')

    // Verify password was hashed with cost factor 10
    expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10)

    // Verify user was created with hashed password
    expect(mockPrismaUser.create).toHaveBeenCalledWith({
      data: {
        email: 'new@example.com',
        name: 'New User',
        passwordHash: '$2a$10$hashed',
      },
    })

    // Verify default project was created
    expect(mockPrismaProject.create).toHaveBeenCalledWith({
      data: {
        userId: 'new-user-123',
        name: 'My Startup',
        status: 'PRE_LAUNCH',
      },
    })
  })

  it('should handle signup without name', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(null)
    mockBcrypt.hash.mockResolvedValue('$2a$10$hashed' as never)
    mockPrismaUser.create.mockResolvedValue({
      id: 'new-user-456',
      email: 'noname@example.com',
      name: undefined,
      passwordHash: '$2a$10$hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)
    mockPrismaProject.create.mockResolvedValue({} as any)

    const request = createRequest({
      email: 'noname@example.com',
      password: 'password123',
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(mockPrismaUser.create).toHaveBeenCalledWith({
      data: {
        email: 'noname@example.com',
        name: undefined,
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
    expect(data.error).toBe('Internal server error')
  })

  it('should not leak error details in 500 response', async () => {
    mockPrismaUser.findUnique.mockRejectedValue(new Error('Sensitive DB info'))

    const request = createRequest({
      email: 'test@example.com',
      password: 'password123',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(data.error).toBe('Internal server error')
    expect(JSON.stringify(data)).not.toContain('Sensitive')
  })
})
