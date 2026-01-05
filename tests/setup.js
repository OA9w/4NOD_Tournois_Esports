import { beforeAll, afterAll, beforeEach } from 'vitest'
import prisma from '../src/config/prisma.js'

beforeAll(async () => {
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  // Clean all tables before each test (order matters for foreign keys)
  await prisma.booking.deleteMany()
  await prisma.user.deleteMany()
  await prisma.station.deleteMany()
  await prisma.game.deleteMany()
})

export { prisma }
