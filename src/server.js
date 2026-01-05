import chalk from 'chalk'
import { env } from './config/env.js'
import prisma from './config/prisma.js'
import app from './app.js'

// Verify database connection on startup
async function initServer() {
  try {
    const usersCount = await prisma.user.count()
    const teamsCount = await prisma.team.count()
    const tournamentsCount = await prisma.tournament.count()
    const registrationsCount = await prisma.registration.count()

    console.log(
      chalk.green(
        `Database connected: ${usersCount} users, ${teamsCount} teams, ${tournamentsCount} tournaments, ${registrationsCount} registrations`
      )
    )
  } catch (error) {
    console.error(chalk.red('Failed to connect to database:'), error.message)
    throw error
  }
}

// Start server
app.listen(env.PORT, async () => {
  await initServer()
  console.log(chalk.cyan(`\nMode: ${env.NODE_ENV}`))
  console.log(chalk.cyan(`Server started on http://localhost:${env.PORT}\n`))
})
