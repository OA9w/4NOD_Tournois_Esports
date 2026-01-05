import prisma from '../config/prisma.js'

// Helpers
const parsePagination = (query = {}) => {
  const page = Math.max(parseInt(query.page || '1', 10), 1)
  const limit = Math.min(Math.max(parseInt(query.limit || '10', 10), 1), 100)
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

const notFound = (msg = 'Tournoi introuvable') => {
  const err = new Error(msg)
  err.status = 404
  return err
}

const badRequest = msg => {
  const err = new Error(msg)
  err.status = 400
  return err
}

const forbidden = msg => {
  const err = new Error(msg)
  err.status = 403
  return err
}

/**
 * GET /api/tournaments?status&game&format&page&limit
 */
export const findAll = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query)

  const where = {}
  if (query.status) where.status = query.status
  if (query.game) where.game = query.game
  if (query.format) where.format = query.format

  const [total, tournaments] = await Promise.all([
    prisma.tournament.count({ where }),
    prisma.tournament.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startDate: 'asc' },
      include: {
        organizer: { select: { id: true, username: true, email: true, role: true } },
      },
    }),
  ])

  return {
    total,
    page,
    limit,
    count: tournaments.length,
    tournaments,
  }
}

export const findById = async id => {
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      organizer: { select: { id: true, username: true, email: true, role: true } },
      registrations: true,
    },
  })

  if (!tournament) throw notFound()
  return tournament
}

/**
 * Create tournaments
 * - status toujours DRAFT
 * - startDate doit être future
 * - organizerId depuis req.user
 */
export const create = async (data, organizerId) => {
  const start = new Date(data.startDate)
  const now = new Date()
  if (Number.isNaN(start.getTime())) throw badRequest('startDate invalide')
  if (start <= now) throw badRequest('startDate doit être dans le futur')

  const hasEndDate = data.endDate !== undefined && data.endDate !== null && data.endDate !== ''
  if (hasEndDate) {
    const end = new Date(data.endDate)
    if (Number.isNaN(end.getTime())) throw badRequest('endDate invalide')
    if (end <= start) throw badRequest('endDate doit être après startDate')
  }

  const maxParticipants = Number(data.maxParticipants)
  if (Number.isNaN(maxParticipants)) throw badRequest('maxParticipants invalide')

  const prizePool = Number(data.prizePool)
  if (Number.isNaN(prizePool)) throw badRequest('prizePool invalide')

  return prisma.tournament.create({
    data: {
      name: data.name,
      game: data.game,
      format: data.format,
      maxParticipants,
      prizePool,
      startDate: start,
      endDate: hasEndDate ? new Date(data.endDate) : null,
      status: 'DRAFT',
      organizerId,
    },
  })
}

/**
 * Update tournaments
 * - interdit si COMPLETED ou CANCELLED
 */
export const update = async (id, data) => {
  const existing = await prisma.tournament.findUnique({ where: { id } })
  if (!existing) throw notFound()

  if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
    throw badRequest('Un tournoi COMPLETED ou CANCELLED ne peut plus être modifié')
  }

  // Revalidation dates si fournies
  let nextStartDate = existing.startDate
  if (data.startDate !== undefined) {
    const start = new Date(data.startDate)
    if (Number.isNaN(start.getTime())) throw badRequest('startDate invalide')
    if (start <= new Date()) throw badRequest('startDate doit être dans le futur')
    nextStartDate = start
  }

  const hasEndDate = data.endDate !== undefined && data.endDate !== ''
  // - undefined => pas de changement
  // - null => set null
  // - string/date => set date
  if (hasEndDate && data.endDate !== null) {
    const end = new Date(data.endDate)
    if (Number.isNaN(end.getTime())) throw badRequest('endDate invalide')
    if (end <= nextStartDate) throw badRequest('endDate doit être après startDate')
  }

  const updateData = {
    name: data.name,
    game: data.game,
    format: data.format,
    maxParticipants:
      data.maxParticipants === undefined ? undefined : Number(data.maxParticipants),
    prizePool: data.prizePool === undefined ? undefined : Number(data.prizePool),
    startDate: data.startDate ? new Date(data.startDate) : undefined,
    endDate:
      data.endDate === undefined
        ? undefined
        : data.endDate === null
          ? null
          : data.endDate === ''
            ? undefined
            : new Date(data.endDate),
  }

  if (updateData.maxParticipants !== undefined && Number.isNaN(updateData.maxParticipants)) {
    throw badRequest('maxParticipants invalide')
  }
  if (updateData.prizePool !== undefined && Number.isNaN(updateData.prizePool)) {
    throw badRequest('prizePool invalide')
  }

  return prisma.tournament.update({
    where: { id },
    data: updateData,
  })
}

/**
 * Delete tournaments
 * - interdit si inscriptions CONFIRMED
 */
export const remove = async id => {
  const existing = await prisma.tournament.findUnique({
    where: { id },
    include: { registrations: { where: { status: 'CONFIRMED' }, select: { id: true } } },
  })
  if (!existing) throw notFound()

  if (existing.registrations.length > 0) {
    throw badRequest('Impossible de supprimer un tournoi ayant des inscriptions CONFIRMED')
  }

  await prisma.tournament.delete({ where: { id } })
}

/**
 * PATCH status transitions
 */
export const updateStatus = async (id, newStatus, actor) => {
  const t = await prisma.tournament.findUnique({
    where: { id },
    include: { registrations: { where: { status: 'CONFIRMED' }, select: { id: true } } },
  })
  if (!t) throw notFound()

  if (newStatus === 'CANCELLED') {
    const isCreator = t.organizerId === actor.userId
    const isAdmin = actor.role === 'ADMIN'
    if (!isCreator && !isAdmin) throw forbidden('Seul le créateur ou un ADMIN peut annuler')
    return prisma.tournament.update({ where: { id }, data: { status: 'CANCELLED' } })
  }

  if (newStatus === 'COMPLETED' && actor.role !== 'ADMIN') {
    throw forbidden('ADMIN uniquement')
  }

  if (t.status === 'DRAFT' && newStatus === 'OPEN') {
    if (t.startDate <= new Date()) throw badRequest('startDate doit être future pour ouvrir')
    return prisma.tournament.update({ where: { id }, data: { status: 'OPEN' } })
  }

  if (t.status === 'OPEN' && newStatus === 'ONGOING') {
    if (t.registrations.length < 2) throw badRequest('Il faut au moins 2 participants CONFIRMED')
    return prisma.tournament.update({ where: { id }, data: { status: 'ONGOING' } })
  }

  if (t.status === 'ONGOING' && newStatus === 'COMPLETED') {
    return prisma.tournament.update({ where: { id }, data: { status: 'COMPLETED' } })
  }

  throw badRequest(`Transition interdite: ${t.status} → ${newStatus}`)
}
