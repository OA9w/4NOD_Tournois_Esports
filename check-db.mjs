import prisma from './src/config/prisma.js'

async function main() {
  console.log('users =', await prisma.user.count())
  console.log('teams =', await prisma.team.count())
  console.log('tournaments =', await prisma.tournament.count())
  console.log('registrations =', await prisma.registration.count())
  await prisma.$disconnect()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
