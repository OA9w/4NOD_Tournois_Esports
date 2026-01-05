import { describe, it, expect } from 'vitest'
import { prisma } from '../setup.js'
import * as gameService from '../../src/services/tournamentService.js'

describe('GameService', () => {
  describe('count', () => {
    it('returns 0 when no teams exist', async () => {
      const count = await gameService.count()
      expect(count).toBe(0)
    })

    it('returns correct count after creating teams', async () => {
      await prisma.game.createMany({
        data: [
          { name: 'Game 1', genre: 'FPS', minPlayers: 1, maxPlayers: 10 },
          { name: 'Game 2', genre: 'MOBA', minPlayers: 2, maxPlayers: 10 },
        ],
      })

      const count = await gameService.count()
      expect(count).toBe(2)
    })
  })

  describe('findAll', () => {
    it('returns empty result when no teams exist', async () => {
      const result = await gameService.findAll()

      expect(result.total).toBe(0)
      expect(result.count).toBe(0)
      expect(result.games).toEqual([])
    })

    it('returns all teams with pagination info', async () => {
      await prisma.game.createMany({
        data: [
          {
            name: 'Counter-Strike 2',
            genre: 'FPS',
            minPlayers: 2,
            maxPlayers: 10,
          },
          {
            name: 'League of Legends',
            genre: 'MOBA',
            minPlayers: 5,
            maxPlayers: 5,
          },
          { name: 'Valorant', genre: 'FPS', minPlayers: 5, maxPlayers: 5 },
        ],
      })

      const result = await gameService.findAll()

      expect(result.total).toBe(3)
      expect(result.count).toBe(3)
      expect(result.games).toHaveLength(3)
    })

    it('filters teams by genre', async () => {
      await prisma.game.createMany({
        data: [
          {
            name: 'Counter-Strike 2',
            genre: 'FPS',
            minPlayers: 2,
            maxPlayers: 10,
          },
          {
            name: 'League of Legends',
            genre: 'MOBA',
            minPlayers: 5,
            maxPlayers: 5,
          },
          { name: 'Valorant', genre: 'FPS', minPlayers: 5, maxPlayers: 5 },
        ],
      })

      const result = await gameService.findAll({ genre: 'FPS' })

      expect(result.total).toBe(2)
      expect(result.games).toHaveLength(2)
      expect(result.games.every(g => g.genre === 'FPS')).toBe(true)
    })

    it('respects limit and offset for pagination', async () => {
      await prisma.game.createMany({
        data: [
          { name: 'Game A', genre: 'FPS', minPlayers: 1, maxPlayers: 10 },
          { name: 'Game B', genre: 'FPS', minPlayers: 1, maxPlayers: 10 },
          { name: 'Game C', genre: 'FPS', minPlayers: 1, maxPlayers: 10 },
          { name: 'Game D', genre: 'FPS', minPlayers: 1, maxPlayers: 10 },
        ],
      })

      const result = await gameService.findAll({ limit: 2, offset: 1 })

      expect(result.total).toBe(4)
      expect(result.count).toBe(2)
      expect(result.games).toHaveLength(2)
    })
  })

  describe('findById', () => {
    it('returns the game when it exists', async () => {
      const created = await prisma.game.create({
        data: { name: 'Test Game', genre: 'RPG', minPlayers: 1, maxPlayers: 4 },
      })

      const game = await gameService.findById(created.id)

      expect(game).toBeDefined()
      expect(game.id).toBe(created.id)
      expect(game.name).toBe('Test Game')
      expect(game.genre).toBe('RPG')
    })

    it('throws 404 error when game does not exist', async () => {
      await expect(gameService.findById(99999)).rejects.toThrow(
        'Game not found'
      )

      try {
        await gameService.findById(99999)
      } catch (error) {
        expect(error.status).toBe(404)
      }
    })
  })

  describe('create', () => {
    it('creates a new game with valid data', async () => {
      const gameData = {
        name: 'New Game',
        genre: 'Strategy',
        minPlayers: 2,
        maxPlayers: 8,
        releaseYear: 2024,
        description: 'A strategic game',
      }

      const game = await gameService.create(gameData)

      expect(game).toBeDefined()
      expect(game.id).toBeDefined()
      expect(game.name).toBe('New Game')
      expect(game.genre).toBe('Strategy')
      expect(game.minPlayers).toBe(2)
      expect(game.maxPlayers).toBe(8)
    })

    it('creates game with minimal required fields', async () => {
      const game = await gameService.create({
        name: 'Minimal Game',
        genre: 'Puzzle',
        minPlayers: 1,
        maxPlayers: 1,
      })

      expect(game.id).toBeDefined()
      expect(game.name).toBe('Minimal Game')
      expect(game.releaseYear).toBeNull()
      expect(game.description).toBeNull()
    })
  })

  describe('update', () => {
    it('updates an existing game', async () => {
      const created = await prisma.game.create({
        data: { name: 'Original', genre: 'FPS', minPlayers: 1, maxPlayers: 10 },
      })

      const updated = await gameService.update(created.id, {
        name: 'Updated Name',
        genre: 'MOBA',
      })

      expect(updated.name).toBe('Updated Name')
      expect(updated.genre).toBe('MOBA')
    })

    it('throws 404 when updating non-existent game', async () => {
      await expect(
        gameService.update(99999, { name: 'New Name' })
      ).rejects.toThrow('Game not found')
    })
  })

  describe('remove', () => {
    it('deletes an existing game', async () => {
      const created = await prisma.game.create({
        data: {
          name: 'To Delete',
          genre: 'FPS',
          minPlayers: 1,
          maxPlayers: 10,
        },
      })

      await gameService.remove(created.id)

      const count = await prisma.game.count()
      expect(count).toBe(0)
    })

    it('throws 404 when deleting non-existent game', async () => {
      await expect(gameService.remove(99999)).rejects.toThrow('Game not found')
    })
  })
})
