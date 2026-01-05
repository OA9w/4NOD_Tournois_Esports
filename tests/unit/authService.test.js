import { describe, it, expect } from 'vitest'
import { prisma } from '../setup.js'
import * as authService from '../../src/services/authService.js'

describe('AuthService', () => {
  describe('hashPassword', () => {
    it('returns a hash different from the original password', async () => {
      const password = 'secret123'
      const hash = await authService.hashPassword(password)

      expect(hash).not.toBe(password)
      expect(hash).toHaveLength(60) // bcrypt hash length
    })

    it('generates different hashes for the same password', async () => {
      const password = 'secret123'
      const hash1 = await authService.hashPassword(password)
      const hash2 = await authService.hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('comparePassword', () => {
    it('returns true for correct password', async () => {
      const password = 'secret123'
      const hash = await authService.hashPassword(password)

      const result = await authService.comparePassword(password, hash)

      expect(result).toBe(true)
    })

    it('returns false for incorrect password', async () => {
      const password = 'secret123'
      const hash = await authService.hashPassword(password)

      const result = await authService.comparePassword('wrongpassword', hash)

      expect(result).toBe(false)
    })
  })

  describe('generateToken', () => {
    it('returns a non-empty string token', () => {
      const user = { id: 1, role: 'user' }
      const token = authService.generateToken(user)

      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('generates token with correct structure (3 parts)', () => {
      const user = { id: 1, role: 'admin' }
      const token = authService.generateToken(user)

      const parts = token.split('.')
      expect(parts).toHaveLength(3)
    })
  })

  describe('verifyToken', () => {
    it('decodes a valid token correctly', () => {
      const user = { id: 42, role: 'admin' }
      const token = authService.generateToken(user)

      const decoded = authService.verifyToken(token)

      expect(decoded.userId).toBe(42)
      expect(decoded.role).toBe('admin')
    })

    it('throws error for invalid token', () => {
      expect(() => authService.verifyToken('invalid-token')).toThrow()
    })

    it('throws error for tampered token', () => {
      const user = { id: 1, role: 'user' }
      const token = authService.generateToken(user)
      const tamperedToken = `${token.slice(0, -5)}xxxxx`

      expect(() => authService.verifyToken(tamperedToken)).toThrow()
    })
  })

  describe('register', () => {
    it('creates a new user successfully', async () => {
      const userData = {
        email: 'newuser@test.com',
        username: 'newuser',
        password: 'password123',
      }

      const user = await authService.register(userData)

      expect(user).toBeDefined()
      expect(user.email).toBe('newuser@test.com')
      expect(user.username).toBe('newuser')
      expect(user.password).toBeUndefined() // Password should not be returned
    })

    it('throws error for duplicate email', async () => {
      await prisma.user.create({
        data: {
          email: 'existing@test.com',
          username: 'existing',
          password: 'hashedpassword',
        },
      })

      await expect(
        authService.register({
          email: 'existing@test.com',
          username: 'newuser',
          password: 'password123',
        })
      ).rejects.toThrow('Cet email est déjà utilisé')
    })

    it('throws error for duplicate username', async () => {
      await prisma.user.create({
        data: {
          email: 'existing@test.com',
          username: 'existinguser',
          password: 'hashedpassword',
        },
      })

      await expect(
        authService.register({
          email: 'new@test.com',
          username: 'existinguser',
          password: 'password123',
        })
      ).rejects.toThrow("Ce nom d'utilisateur est déjà pris")
    })
  })

  describe('login', () => {
    it('returns user and token for valid credentials', async () => {
      const password = 'password123'
      const hash = await authService.hashPassword(password)

      await prisma.user.create({
        data: {
          email: 'login@test.com',
          username: 'loginuser',
          password: hash,
        },
      })

      const result = await authService.login('login@test.com', password)

      expect(result.user).toBeDefined()
      expect(result.user.email).toBe('login@test.com')
      expect(result.user.password).toBeUndefined()
      expect(result.token).toBeDefined()
    })

    it('throws error for non-existent user', async () => {
      await expect(
        authService.login('nonexistent@test.com', 'password')
      ).rejects.toThrow('Email ou mot de passe incorrect')
    })

    it('throws error for wrong password', async () => {
      const hash = await authService.hashPassword('correctpassword')

      await prisma.user.create({
        data: {
          email: 'user@test.com',
          username: 'testuser',
          password: hash,
        },
      })

      await expect(
        authService.login('user@test.com', 'wrongpassword')
      ).rejects.toThrow('Email ou mot de passe incorrect')
    })
  })

  describe('getUserById', () => {
    it('returns user without password', async () => {
      const created = await prisma.user.create({
        data: {
          email: 'findme@test.com',
          username: 'findme',
          password: 'hashedpassword',
        },
      })

      const user = await authService.getUserById(created.id)

      expect(user).toBeDefined()
      expect(user.email).toBe('findme@test.com')
      expect(user.password).toBeUndefined()
    })

    it('returns null for non-existent user', async () => {
      const user = await authService.getUserById(99999)

      expect(user).toBeNull()
    })
  })
})
