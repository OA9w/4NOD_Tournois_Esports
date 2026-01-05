import * as teamService from '../services/teamService.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import * as response from '../utils/responseHelper.js'

const parseId = (value) => {
  const id = parseInt(value, 10)
  if (Number.isNaN(id)) {
    const err = new Error('ID invalide')
    err.status = 400
    throw err
  }
  return id
}

export const getAll = asyncHandler(async (_req, res) => {
  const teams = await teamService.findAll()
  res.json(response.success(teams))
})

export const getById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id)
  const team = await teamService.findById(id)
  res.json(response.success(team))
})

export const create = asyncHandler(async (req, res) => {
  const team = await teamService.create(req.body, req.user.userId)
  res.status(201).json(response.created(team))
})

export const update = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id)
  const team = await teamService.update(id, req.body, req.user.userId)
  res.json(response.success(team))
})

export const remove = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id)
  await teamService.remove(id, req.user.userId)
  res.status(204).send()
})
