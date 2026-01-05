import prisma from '../config/prisma.js'

const notFound = (msg = 'Équipe introuvable') =>
  Object.assign(new Error(msg), { status: 404 })
const badRequest = msg => Object.assign(new Error(msg), { status: 400 })
const forbidden = msg => Object.assign(new Error(msg), { status: 403 })

/**
 * Get all teams (simple list)
 * GET /api/teams
 */
export async function findAll() {
  const teams = await prisma.team.findMany({
    orderBy: { name: 'asc' },
    include: {
      captain: { select: { id: true, username: true, email: true, role: true } },
      _count: { select: { members: true } },
    },
  })

  return { total: teams.length, count: teams.length, teams }
}

/**
 * Get a team by ID (with captain + members)
 * GET /api/teams/:id
 */
export const findById = async id => {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      captain: { select: { id: true, username: true, email: true, role: true } },
      members: { select: { id: true, username: true, email: true, role: true } },
    },
  })

  if (!team) throw notFound()
  return team
}

/**
 * Create a team
 * POST /api/teams
 * - authenticated user becomes captain
 * - captain must have role PLAYER
 * - captain must not already belong to a team
 * - name unique, tag unique
 */
export const create = async (data, captainUserId) => {
  const captain = await prisma.user.findUnique({
    where: { id: captainUserId },
    select: { id: true, role: true, teamId: true },
  })
  if (!captain) throw notFound('Utilisateur introuvable')
  if (captain.role !== 'PLAYER') throw badRequest('Le capitaine doit avoir role = PLAYER')

  // cannot create if already in a team (User.teamId is single)
  if (captain.teamId) {
    throw badRequest("Vous êtes déjà membre d'une équipe")
  }

  const normalized = {
    name: data.name?.trim(),
    tag: data.tag?.trim().toUpperCase(),
  }

  const existing = await prisma.team.findFirst({
    where: { OR: [{ name: normalized.name }, { tag: normalized.tag }] },
  })
  if (existing) {
    if (existing.name === normalized.name) throw badRequest("Nom d'équipe déjà utilisé")
    throw badRequest("Tag d'équipe déjà utilisé")
  }

  return prisma.team.create({
    data: {
      name: normalized.name,
      tag: normalized.tag,
      captainId: captainUserId,
      // relation 1-N via User.teamId -> connect sets teamId
      members: { connect: { id: captainUserId } },
    },
    include: {
      captain: { select: { id: true, username: true, email: true, role: true } },
      members: { select: { id: true, username: true, email: true, role: true } },
    },
  })
}

/**
 * Update a team (captain only)
 * PUT /api/teams/:id
 */
export const update = async (id, data, actorUserId) => {
  const team = await prisma.team.findUnique({ where: { id } })
  if (!team) throw notFound()

  if (team.captainId !== actorUserId) {
    throw forbidden("Seul le capitaine peut modifier l'équipe")
  }

  const normalized = {
    name: data.name?.trim(),
    tag: data.tag?.trim().toUpperCase(),
  }

  const existing = await prisma.team.findFirst({
    where: {
      AND: [
        { id: { not: id } },
        { OR: [{ name: normalized.name }, { tag: normalized.tag }] },
      ],
    },
  })
  if (existing) {
    if (existing.name === normalized.name) throw badRequest("Nom d'équipe déjà utilisé")
    throw badRequest("Tag d'équipe déjà utilisé")
  }

  return prisma.team.update({
    where: { id },
    data: {
      name: normalized.name,
      tag: normalized.tag,
    },
    include: {
      captain: { select: { id: true, username: true, email: true, role: true } },
      members: { select: { id: true, username: true, email: true, role: true } },
    },
  })
}

/**
 * Delete a team (captain only)
 * DELETE /api/teams/:id
 * - forbidden if registered to an active tournament (OPEN/ONGOING)
 */
export const remove = async (id, actorUserId) => {
  const team = await prisma.team.findUnique({ where: { id } })
  if (!team) throw notFound()

  if (team.captainId !== actorUserId) {
    throw forbidden("Seul le capitaine peut supprimer l'équipe")
  }

  const activeRegs = await prisma.registration.count({
    where: {
      teamId: id,
      tournament: { status: { in: ['OPEN', 'ONGOING'] } },
    },
  })
  if (activeRegs > 0) {
    throw badRequest("Impossible de supprimer une équipe inscrite à un tournoi actif")
  }

  // detach members before deletion (User.teamId -> null)
  await prisma.user.updateMany({
    where: { teamId: id },
    data: { teamId: null },
  })

  await prisma.team.delete({ where: { id } })
}
