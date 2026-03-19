import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}))

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const mockPrismaUser = vi.mocked(prisma.user)
const mockBcrypt = vi.mocked(bcrypt)

// Extract the authorize function from credentials provider
function getAuthorize() {
  const credentialsProvider = authOptions.providers[0]
  // @ts-expect-error - accessing internal authorize method
  return credentialsProvider.options.authorize as (
    credentials: { email: string; password: string } | undefined
  ) => Promise<{ id: string; email: string; name: string | null } | null>
}

describe('Auth Module - authOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Provider configuration', () => {
    it('should use credentials provider', () => {
      expect(authOptions.providers).toHaveLength(1)
      expect(authOptions.providers[0].id).toBe('credentials')
    })

    it('should use JWT session strategy', () => {
      expect(authOptions.session?.strategy).toBe('jwt')
    })

    it('should set custom sign-in page to /login', () => {
      expect(authOptions.pages?.signIn).toBe('/login')
    })

    it('should use NEXTAUTH_SECRET from env', () => {
      expect(authOptions.secret).toBe(process.env.NEXTAUTH_SECRET)
    })
  })

  describe('authorize()', () => {
    const authorize = getAuthorize()

    it('should throw if credentials are missing', async () => {
      await expect(authorize(undefined)).rejects.toThrow('Invalid credentials')
    })

    it('should throw if email is missing', async () => {
      await expect(
        authorize({ email: '', password: 'password123' })
      ).rejects.toThrow('Invalid credentials')
    })

    it('should throw if password is missing', async () => {
      await expect(
        authorize({ email: 'test@example.com', password: '' })
      ).rejects.toThrow('Invalid credentials')
    })

    it('should throw if user is not found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null)

      await expect(
        authorize({ email: 'notfound@example.com', password: 'password123' })
      ).rejects.toThrow('Invalid credentials')

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { email: 'notfound@example.com' },
      })
    })

    it('should throw if user has no passwordHash', async () => {
      mockPrismaUser.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        name: 'Test',
        passwordHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)

      await expect(
        authorize({ email: 'test@example.com', password: 'password123' })
      ).rejects.toThrow('Invalid credentials')
    })

    it('should throw if password does not match', async () => {
      mockPrismaUser.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        name: 'Test',
        passwordHash: '$2a$10$hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)
      mockBcrypt.compare.mockResolvedValue(false as never)

      await expect(
        authorize({ email: 'test@example.com', password: 'wrongpassword' })
      ).rejects.toThrow('Invalid credentials')
    })

    it('should return user object on successful authentication', async () => {
      mockPrismaUser.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: '$2a$10$hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)
      mockBcrypt.compare.mockResolvedValue(true as never)

      const result = await authorize({
        email: 'test@example.com',
        password: 'correctpassword',
      })

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      })
    })

    it('should not return passwordHash in the result', async () => {
      mockPrismaUser.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: '$2a$10$hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)
      mockBcrypt.compare.mockResolvedValue(true as never)

      const result = await authorize({
        email: 'test@example.com',
        password: 'correctpassword',
      })

      expect(result).not.toHaveProperty('passwordHash')
    })
  })

  describe('JWT callback', () => {
    const jwtCallback = authOptions.callbacks!.jwt!

    it('should add user id to token when user is present', async () => {
      const token = { sub: 'sub-123' }
      const user = { id: 'user-456', email: 'test@example.com', name: 'Test' }

      const result = await jwtCallback({
        token,
        user,
        account: null,
        trigger: 'signIn',
      } as any)

      expect(result.id).toBe('user-456')
    })

    it('should return token unchanged when no user (subsequent requests)', async () => {
      const token = { sub: 'sub-123', id: 'user-456' }

      const result = await jwtCallback({
        token,
        user: undefined as any,
        account: null,
        trigger: 'update',
      } as any)

      expect(result.id).toBe('user-456')
    })
  })

  describe('Session callback', () => {
    const sessionCallback = authOptions.callbacks!.session!

    it('should add user id from token to session', async () => {
      const session = { user: { name: 'Test', email: 'test@example.com' }, expires: '' }
      const token = { id: 'user-789', sub: 'sub' }

      const result = await sessionCallback({
        session,
        token,
        user: undefined as any,
        trigger: 'update',
        newSession: undefined,
      } as any)

      expect(result.user.id).toBe('user-789')
    })
  })
})
