import * as tournamentService from '../services/tournamentService.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import * as response from '../utils/responseHelper.js'

/**
 * GET /api/tournaments
 * List all tournaments with filters and pagination
 */
export const getAll = asyncHandler(async (req, res) => {
  const result = await tournamentService.findAll(req.query)
  res.json(response.success(result))
})

/**
 * GET /api/tournaments/:id
 * Get a tournaments by its ID
 */
export const getById = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id)
  const tournament = await tournamentService.findById(id)
  res.json(response.success(tournament))
})

/**
 * POST /api/tournaments
 * Create a new tournaments
 */
export const create = asyncHandler(async (req, res) => {
  const tournament = await tournamentService.create(req.body, req.user.userId)
  res.status(201).json(response.created(tournament))
})


/**
 * PUT /api/tournaments/:id
 * Update a tournaments
 */
export const update = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id)
  const tournament = await tournamentService.update(id, req.body)
  res.json(response.success(tournament))
})

/**
 * DELETE /api/tournaments/:id
 * Delete a tournaments
 */
export const remove = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id)
  await tournamentService.remove(id)
  res.status(204).send()
})

export const updateStatus = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id)
  const tournament = await tournamentService.updateStatus(id, req.body.status, req.user)
  res.json(response.success(tournament))
})

