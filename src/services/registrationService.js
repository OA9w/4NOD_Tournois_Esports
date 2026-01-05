import prisma from '../config/prisma.js'

const notFound = (msg = 'Ressource introuvable') => Object.assign(new Error(msg), { status: 404 })
const badRequest = msg => Object.assign(new Error(msg), { status: 400 })
const forbidden = msg => Object.assign(new Error(msg), { status: 403 })

const isOrganizerOrAdmin = (tournament, user) =>
  user.role === 'ADMIN' || tournament.organizerId === user.userId

export const register = async (tournamentId, data, user) => {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } })
  if (!tournament) throw notFound('Tournoi introuvable')

  // Inscription possible uniquement si OPEN
  if (tournament.status !== 'OPEN') {
    throw badRequest("Inscription possible uniquement si le tournoi est OPEN")
  }

  const wantsTeam = typeof data.teamId === 'number'

  // Cohérence format
  if (tournament.format === 'SOLO' && wantsTeam) {
    throw badRequest('Tournoi SOLO: inscription en équipe interdite')
  }
  if (tournament.format === 'TEAM' && !wantsTeam) {
    throw badRequest('Tournoi TEAM: teamId est requis')
  }

  // Unicité
  if (tournament.format === 'SOLO') {
    const exists = await prisma.registration.findFirst({
      where: { tournamentId, playerId: user.userId },
    })
    if (exists) throw badRequest('Ce joueur est déjà inscrit à ce tournoi')
  } else {
    const exists = await prisma.registration.findFirst({
      where: { tournamentId, teamId: data.teamId },
    })
    if (exists) throw badRequest('Cette équipe est déjà inscrite à ce tournoi')
  }

  // Limite participants (CONFIRMED uniquement)
  const confirmedCount = await prisma.registration.count({
    where: { tournamentId, status: 'CONFIRMED' },
  })
  if (confirmedCount >= tournament.maxParticipants) {
    throw badRequest('Le tournoi est complet (maxParticipants atteint)')
  }

  // TEAM: vérifier que l’utilisateur est capitaine
  if (tournament.format === 'TEAM') {
    const team = await prisma.team.findUnique({ where: { id: data.teamId } })
    if (!team) throw notFound('Équipe introuvable')
    if (team.captainId !== user.userId) {
      throw forbidden("Seul le capitaine peut inscrire l'équipe")
    }
  }

  // Créer registrations (PENDING par défaut)
  return prisma.registration.create({
    data: {
      tournamentId,
      status: 'PENDING',
      playerId: tournament.format === 'SOLO' ? user.userId : null,
      teamId: tournament.format === 'TEAM' ? data.teamId : null,
    },
    include: {
      player: { select: { id: true, username: true, email: true } },
      team: { select: { id: true, name: true, tag: true, captainId: true } },
      tournament: { select: { id: true, name: true, status: true, format: true } },
    },
  })
}

export const list = async (tournamentId, user) => {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } })
  if (!tournament) throw notFound('Tournoi introuvable')

  // Option “safe”: organisateur/admin voit tout, sinon uniquement ses inscriptions
  const baseInclude = {
    player: { select: { id: true, username: true, email: true } },
    team: { select: { id: true, name: true, tag: true, captainId: true } },
  }

  if (isOrganizerOrAdmin(tournament, user)) {
    const regs = await prisma.registration.findMany({
      where: { tournamentId },
      orderBy: { registeredAt: 'desc' },
      include: baseInclude,
    })
    return { total: regs.length, count: regs.length, registrations: regs }
  }

  const regs = await prisma.registration.findMany({
    where: {
      tournamentId,
      OR: [
        { playerId: user.userId },
        { team: { captainId: user.userId } },
      ],
    },
    orderBy: { registeredAt: 'desc' },
    include: baseInclude,
  })
  return { total: regs.length, count: regs.length, registrations: regs }
}

export const updateStatus = async (tournamentId, id, newStatus, user) => {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } })
  if (!tournament) throw notFound('Tournoi introuvable')

  const reg = await prisma.registration.findUnique({
    where: { id },
    include: { team: true },
  })
  if (!reg || reg.tournamentId !== tournamentId) throw notFound('Inscription introuvable')

  const isParticipant =
    reg.playerId === user.userId ||
    (reg.teamId && reg.team?.captainId === user.userId)

  if (!isOrganizerOrAdmin(tournament, user) && !isParticipant) {
    throw forbidden("Seul l'organisateur ou le participant peut modifier cette inscription")
  }

  // Refuser confirmation si max atteint
  if (newStatus === 'CONFIRMED') {
    const confirmedCount = await prisma.registration.count({
      where: { tournamentId, status: 'CONFIRMED' },
    })
    if (confirmedCount >= tournament.maxParticipants) {
      throw badRequest('Impossible de confirmer: maxParticipants atteint')
    }
  }

  const data = { status: newStatus }
  if (newStatus === 'CONFIRMED') data.confirmedAt = new Date()
  if (newStatus !== 'CONFIRMED') data.confirmedAt = null

  return prisma.registration.update({
    where: { id },
    data,
    include: {
      player: { select: { id: true, username: true, email: true } },
      team: { select: { id: true, name: true, tag: true, captainId: true } },
      tournament: { select: { id: true, name: true, status: true, format: true } },
    },
  })
}

export const remove = async (tournamentId, id, user) => {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } })
  if (!tournament) throw notFound('Tournoi introuvable')

  const reg = await prisma.registration.findUnique({
    where: { id },
    include: { team: true },
  })
  if (!reg || reg.tournamentId !== tournamentId) throw notFound('Inscription introuvable')

  const isParticipant =
    reg.playerId === user.userId ||
    (reg.teamId && reg.team?.captainId === user.userId)

  if (!isOrganizerOrAdmin(tournament, user) && !isParticipant) {
    throw forbidden("Seul l'organisateur ou le participant peut annuler cette inscription")
  }

  // Sujet: DELETE uniquement si PENDING
  if (reg.status !== 'PENDING') {
    throw badRequest('Suppression possible uniquement si status = PENDING')
  }

  await prisma.registration.delete({ where: { id } })
}
