import { Router } from 'express'
import * as tournamentService from '../services/tournamentService.js'
import * as teamService from '../services/teamService.js'
import * as registrationService from '../services/registrationService.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

/* =========================
   HOME
========================= */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [tournaments, teams] = await Promise.all([
      tournamentService.findAll({ limit: 5 }),
      teamService.findAll(),
    ])

    res.render('pages/home', {
      tournaments: tournaments.tournaments,
      teams: teams.teams ?? teams,
    })
  })
)

/* =========================
   TOURNAMENTS
========================= */

// List tournaments
router.get(
  '/tournaments',
  asyncHandler(async (req, res) => {
    const result = await tournamentService.findAll(req.query)
    res.render('pages/tournaments/list', {
      tournaments: result.tournaments,
    })
  })
)

// Tournament detail
router.get(
  '/tournaments/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(404).render('pages/error', {
        title: 'Tournoi introuvable',
        message: 'ID invalide',
      })
    }

    const tournament = await tournamentService.findById(id)
    res.render('pages/tournaments/detail', { tournament })
  })
)

/* =========================
   TEAMS
========================= */

// List teams
router.get(
  '/teams',
  asyncHandler(async (_req, res) => {
    const result = await teamService.findAll()
    res.render('pages/teams/list', {
      teams: result.teams ?? result,
    })
  })
)

// Team detail
router.get(
  '/teams/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(404).render('pages/error', {
        title: 'Équipe introuvable',
        message: 'ID invalide',
      })
    }

    const team = await teamService.findById(id)
    res.render('pages/teams/detail', { team })
  })
)

/* =========================
   REGISTRATIONS
========================= */

// List registrations for a tournaments
router.get(
  '/tournaments/:id/registrations',
  asyncHandler(async (req, res) => {
    const tournamentId = Number(req.params.id)
    if (Number.isNaN(tournamentId)) {
      return res.status(404).render('pages/error', {
        title: 'Tournoi introuvable',
        message: 'ID invalide',
      })
    }

    const tournament = await tournamentService.findById(tournamentId)
    const registrations = await registrationService.list(
      tournamentId,
      req.session?.user || { role: 'ADMIN', userId: null }
    )

    res.render('pages/registrations/list', {
      tournament,
      registrations: registrations.registrations ?? registrations,
    })
  })
)

export default router
