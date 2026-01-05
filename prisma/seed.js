import 'dotenv/config'
import bcrypt from 'bcrypt'
import prisma from '../src/config/prisma.js'

async function main() {
  console.log('🌱 Seeding...')

  await prisma.registration.deleteMany()
  await prisma.tournament.deleteMany()
  await prisma.team.deleteMany()
  await prisma.user.deleteMany()

  const adminPassword = await bcrypt.hash('admin1234', 10)
  const playerPassword = await bcrypt.hash('player1234', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@esport.test',
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  const player = await prisma.user.create({
    data: {
      email: 'player@esport.test',
      username: 'player1',
      password: playerPassword,
      role: 'PLAYER',
    },
  })

  const team = await prisma.team.create({
    data: {
      name: 'Team Alpha',
      tag: 'ALPHA',
      captainId: player.id,
      members: { connect: [{ id: player.id }] },
    },
  })

  const tournament = await prisma.tournament.create({
    data: {
      name: 'CS2 Cup',
      game: 'Counter-Strike 2',
      format: 'TEAM',
      maxParticipants: 8,
      prizePool: 500,
      startDate: new Date(Date.now() + 86400000),
      status: 'OPEN',
      organizerId: admin.id,
    },
  })

  await prisma.registration.create({
    data: {
      tournamentId: tournament.id,
      teamId: team.id,
      status: 'PENDING',
    },
  })

  console.log('✅ Seed OK')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
