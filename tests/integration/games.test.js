import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'
import { prisma } from '../setup.js'
import {
  createAuthenticatedUser,
  createTestGame,
} from '../helpers/testHelpers.js'

describe('Games Routes', () => {
  describe('GET /api/teams', () => {
    it('returns 200 and empty array when no teams', async () => {
      const response = await request(app).get('/api/games')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.games).toEqual([])
      expect(response.body.data.total).toBe(0)
    })

    it('returns all teams', async () => {
      await prisma.game.createMany({
        data: [
          { name: 'Game 1', genre: 'FPS', minPlayers: 1, maxPlayers: 10 },
          { name: 'Game 2', genre: 'MOBA', minPlayers: 2, maxPlayers: 10 },
        ],
      })

      const response = await request(app).get('/api/games')

      expect(response.status).toBe(200)
      expect(response.body.data.games).toHaveLength(2)
      expect(response.body.data.total).toBe(2)
    })

    it('filters teams by genre', async () => {
      await prisma.game.createMany({
        data: [
          { name: 'CS2', genre: 'FPS', minPlayers: 2, maxPlayers: 10 },
          { name: 'LoL', genre: 'MOBA', minPlayers: 5, maxPlayers: 5 },
          { name: 'Valorant', genre: 'FPS', minPlayers: 5, maxPlayers: 5 },
        ],
      })

      const response = await request(app).get('/api/games?genre=FPS')

      expect(response.status).toBe(200)
      expect(response.body.data.games).toHaveLength(2)
      expect(response.body.data.games.every(g => g.genre === 'FPS')).toBe(true)
    })
  })

  describe('GET /api/teams/:id', () => {
    it('returns game by id', async () => {
      const game = await createTestGame({ name: 'Test Game' })

      const response = await request(app).get(`/api/games/${game.id}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe('Test Game')
    })

    it('returns 404 for non-existent game', async () => {
      const response = await request(app).get('/api/games/99999')

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/teams', () => {
    it('creates a game with valid auth', async () => {
      const { token } = await createAuthenticatedUser()

      const response = await request(app)
        .post('/api/games')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Game',
          genre: 'RPG',
          minPlayers: 1,
          maxPlayers: 4,
          releaseYear: 2024,
        })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe('New Game')
    })

    it('returns 401 without token', async () => {
      const response = await request(app).post('/api/games').send({
        name: 'New Game',
        genre: 'RPG',
        minPlayers: 1,
        maxPlayers: 4,
      })

      expect(response.status).toBe(401)
    })

    it('returns 400 for invalid data', async () => {
      const { token } = await createAuthenticatedUser()

      const response = await request(app)
        .post('/api/games')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '', // Invalid: empty name
          genre: 'RPG',
        })

      expect(response.status).toBe(400)
    })
  })

  describe('PUT /api/teams/:id', () => {
    it('updates a game with valid auth', async () => {
      const { token } = await createAuthenticatedUser()
      const game = await createTestGame({ name: 'Original' })

      const response = await request(app)
        .put(`/api/games/${game.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Game',
          genre: 'Strategy',
          minPlayers: 2,
          maxPlayers: 8,
        })

      expect(response.status).toBe(200)
      expect(response.body.data.name).toBe('Updated Game')
      expect(response.body.data.genre).toBe('Strategy')
    })

    it('returns 401 without token', async () => {
      const game = await createTestGame()

      const response = await request(app).put(`/api/games/${game.id}`).send({
        name: 'Updated',
        genre: 'FPS',
        minPlayers: 1,
        maxPlayers: 10,
      })

      expect(response.status).toBe(401)
    })

    it('returns 404 for non-existent game', async () => {
      const { token } = await createAuthenticatedUser()

      const response = await request(app)
        .put('/api/games/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated',
          genre: 'FPS',
          minPlayers: 1,
          maxPlayers: 10,
        })

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/teams/:id', () => {
    it('deletes a game with valid auth', async () => {
      const { token } = await createAuthenticatedUser()
      const game = await createTestGame()

      const response = await request(app)
        .delete(`/api/games/${game.id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(204)

      // Verify deletion
      const count = await prisma.game.count()
      expect(count).toBe(0)
    })

    it('returns 401 without token', async () => {
      const game = await createTestGame()

      const response = await request(app).delete(`/api/games/${game.id}`)

      expect(response.status).toBe(401)
    })

    it('returns 404 for non-existent game', async () => {
      const { token } = await createAuthenticatedUser()

      const response = await request(app)
        .delete('/api/games/99999')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
    })
  })
})
