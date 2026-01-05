import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'
import { prisma } from '../setup.js'
import * as authService from '../../src/services/authService.js'

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('creates a new user and returns 201', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'newuser@test.com',
        username: 'newuser',
        password: 'password123',
      })

      expect(response.status).toBe(201)
      expect(response.body.message).toBe('Inscription réussie')
      expect(response.body.user).toBeDefined()
      expect(response.body.user.email).toBe('newuser@test.com')
      expect(response.body.user.password).toBeUndefined()
    })

    it('returns 400 for duplicate email', async () => {
      await prisma.user.create({
        data: {
          email: 'existing@test.com',
          username: 'existing',
          password: await authService.hashPassword('password'),
        },
      })

      const response = await request(app).post('/api/auth/register').send({
        email: 'existing@test.com',
        username: 'newuser',
        password: 'password123',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('email')
    })

    it('returns 400 for duplicate username', async () => {
      await prisma.user.create({
        data: {
          email: 'existing@test.com',
          username: 'existinguser',
          password: await authService.hashPassword('password'),
        },
      })

      const response = await request(app).post('/api/auth/register').send({
        email: 'new@test.com',
        username: 'existinguser',
        password: 'password123',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('utilisateur')
    })
  })

  describe('POST /api/auth/login', () => {
    it('returns token for valid credentials', async () => {
      const password = 'password123'
      await prisma.user.create({
        data: {
          email: 'login@test.com',
          username: 'loginuser',
          password: await authService.hashPassword(password),
        },
      })

      const response = await request(app).post('/api/auth/login').send({
        email: 'login@test.com',
        password: password,
      })

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Connexion réussie')
      expect(response.body.token).toBeDefined()
      expect(response.body.user.email).toBe('login@test.com')
    })

    it('returns 401 for wrong password', async () => {
      await prisma.user.create({
        data: {
          email: 'user@test.com',
          username: 'testuser',
          password: await authService.hashPassword('correctpassword'),
        },
      })

      const response = await request(app).post('/api/auth/login').send({
        email: 'user@test.com',
        password: 'wrongpassword',
      })

      expect(response.status).toBe(401)
      expect(response.body.error).toBeDefined()
    })

    it('returns 401 for non-existent user', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@test.com',
        password: 'password123',
      })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/auth/profile', () => {
    it('returns user profile with valid token', async () => {
      const password = 'password123'
      const user = await prisma.user.create({
        data: {
          email: 'profile@test.com',
          username: 'profileuser',
          password: await authService.hashPassword(password),
        },
      })

      const token = authService.generateToken(user)

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.email).toBe('profile@test.com')
      expect(response.body.password).toBeUndefined()
    })

    it('returns 401 without token', async () => {
      const response = await request(app).get('/api/auth/profile')

      expect(response.status).toBe(401)
      expect(response.body.error).toContain('Token')
    })

    it('returns 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')

      expect(response.status).toBe(401)
    })
  })
})
