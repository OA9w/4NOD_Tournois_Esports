// Validate tournament data (flat structure for Prisma)
import tournament from "ejs";

export function validateTournament(tournament) {
  const errors = []

  // Validate name
  if (!tournament.name || tournament.name.trim() === "") {
    errors.push('Field "name" is required')
  } else if (tournament.name.length > 100) {
    errors.push('Field "name" must be at most 100 characters')
  }

  // Validate game
  if (!tournament.game || tournament.game.trim() === "") {
    errors.push('Field "game" is required')
  } else if (tournament.game.length > 100) {
    errors.push('Field "game" must be at most 100 characters')
  }

  // Validate format
  const validFormats = ["SOLO", "TEAM"]
  if (!tournament.format || !validFormats.includes(tournament.format)) {
    errors.push('Field "format" is required and must be one of: SOLO, TEAM')
  }

  // Validate maxParticipants
  if (tournament.maxParticipants === undefined || tournament.maxParticipants === null || tournament.maxParticipants === "") {
    errors.push('Field "maxParticipants" is required')
  } else {
    const maxParticipantsNumber = Number(tournament.maxParticipants)
    if (Number.isNaN(maxParticipantsNumber)) {
      errors.push('Field "maxParticipants" must be a number')
    } else if (!Number.isInteger(maxParticipantsNumber)) {
      errors.push('Field "maxParticipants" must be an integer')
    } else if (maxParticipantsNumber < 2) {
      errors.push('Field "maxParticipants" must be at least 2')
    }
  }

  // Validate prizePool
  if (tournament.prizePool === undefined || tournament.prizePool === null || tournament.prizePool === "") {
    errors.push('Field "prizePool" is required')
  } else {
    const prizePoolNumber = Number(tournament.prizePool)
    if (Number.isNaN(prizePoolNumber)) {
      errors.push('Field "prizePool" must be a number')
    } else if (prizePoolNumber < 0) {
      errors.push('Field "prizePool" must be >= 0')
    }
  }

  // Validate startDate
  if (!tournament.startDate) {
    errors.push('Field "startDate" is required')
  } else {
    const start = new Date(tournament.startDate)
    if (Number.isNaN(start.getTime())) {
      errors.push('Field "startDate" must be a valid date')
    }
  }

  // Validate endDate (optional/nullable) + rule endDate > startDate
  // endDate is allowed to be undefined/null/empty string
  const hasEndDate =
    tournament.endDate !== undefined &&
    tournament.endDate !== null &&
    tournament.endDate !== ""

  if (hasEndDate) {
    const end = new Date(tournament.endDate)
    if (Number.isNaN(end.getTime())) {
      errors.push('Field "endDate" must be a valid date')
    } else if (tournament.startDate) {
      const start = new Date(tournament.startDate)
      if (!Number.isNaN(start.getTime()) && end <= start) {
        errors.push('Field "endDate" must be after "startDate"')
      }
    }
  }

  return errors
}
