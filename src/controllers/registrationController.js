import * as registrationService from '../services/registrationService.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import * as response from '../utils/responseHelper.js'

const parseId = (value, name = 'id') => {
  const n = parseInt(value, 10)
  if (Number.isNaN(n)) {
    const err = new Error(`${name} invalide`)
    err.status = 400
    throw err
  }
  return n
}

/**
 * POST /api/tournaments/:tournamentId/register
 * Inscription SOLO ou TEAM
 */
export const register = asyncHandler(async (req, res) => {
  const tournamentId = parseId(req.params.tournamentId, 'tournamentId')
  const reg = await registrationService.register(tournamentId, req.body, req.user)
  res.status(201).json(response.created(reg))
})

/**
 * GET /api/tournaments/:tournamentId/registrations
 * Liste des inscriptions
 */
export const list = asyncHandler(async (req, res) => {
  const tournamentId = parseId(req.params.tournamentId, 'tournamentId')
  const regs = await registrationService.list(tournamentId, req.user)
  res.json(response.success(regs))
})

/**
 * PATCH /api/tournaments/:tournamentId/registrations/:id
 * Modifier statut (organisateur ou participant)
 */
export const updateStatus = asyncHandler(async (req, res) => {
  const tournamentId = parseId(req.params.tournamentId, 'tournamentId')
  const id = parseId(req.params.id, 'id')
  const reg = await registrationService.updateStatus(
    tournamentId,
    id,
    req.body.status,
    req.user
  )
  res.json(response.success(reg))
})

/**
 * DELETE /api/tournaments/:tournamentId/registrations/:id
 * Annuler si PENDING
 */
export const remove = asyncHandler(async (req, res) => {
  const tournamentId = parseId(req.params.tournamentId, 'tournamentId')
  const id = parseId(req.params.id, 'id')
  await registrationService.remove(tournamentId, id, req.user)
  res.status(204).send()
})
