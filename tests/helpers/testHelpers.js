import request from 'supertest'
import app from '../../src/app.js'
import { prisma } from '../setup.js'
import * as authService from '../../src/services/authService.js'

/**
 * Create a test user in the database
 * @param {string} role - User role (user or admin)
 * @returns {Promise<Object>} Created user
 */
export async function createTestUser(role = 'user') {
  const timestamp = Date.now()
  const hash = await authService.hashPassword('password123')

  return prisma.user.create({
    data: {
      email: `test-${timestamp}@test.com`,
      username: `testuser-${timestamp}`,
      password: hash,
      role,
    },
  })
}

/**
 * Get an auth token for a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<string>} JWT token
 */
export async function getAuthToken(email, password = 'password123') {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password })

  return response.body.token
}

/**
 * Create a test user and get their auth token
 * @param {string} role - User role
 * @returns {Promise<{user: Object, token: string}>} User and token
 */
export async function createAuthenticatedUser(role = 'user') {
  const user = await createTestUser(role)
  const token = await getAuthToken(user.email)

  return { user, token }
}

/**
 * Create a test game in the database
 * @param {Object} overrides - Optional field overrides
 * @returns {Promise<Object>} Created game
 */
export function createTestGame(overrides = {}) {
  return prisma.game.create({
    data: {
      name: `Test Game ${Date.now()}`,
      genre: 'FPS',
      minPlayers: 1,
      maxPlayers: 10,
      releaseYear: 2024,
      description: 'A test game',
      ...overrides,
    },
  })
}

/**
 * Create a test station in the database
 * @param {Object} overrides - Optional field overrides
 * @returns {Promise<Object>} Created station
 */
export function createTestStation(overrides = {}) {
  return prisma.station.create({
    data: {
      name: `Station ${Date.now()}`,
      cpu: 'Intel i7',
      gpu: 'RTX 4080',
      ram: '32GB',
      storage: '1TB SSD',
      monitor: '27" 144Hz',
      keyboard: 'Mechanical',
      mouse: 'Gaming Mouse',
      headset: 'Gaming Headset',
      status: 'available',
      ...overrides,
    },
  })
}
