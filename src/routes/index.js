import { Router } from 'express'
import authRoutes from './authRoutes.js'
import tournamentRoutes from './tournamentRoutes.js'
import teamRoutes from './teamRoutes.js'
import registrationRoutes from './registrationRoutes.js'
import userRoutes from './userRoutes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/tournaments', tournamentRoutes)
router.use('/teams', teamRoutes)
router.use('/users', userRoutes)

// routes d’inscription liées à un tournoi
router.use('/tournaments/:tournamentId', registrationRoutes)
// ex: POST /tournaments/:tournamentId/register
// ex: GET  /tournaments/:tournamentId/registrations

export default router
