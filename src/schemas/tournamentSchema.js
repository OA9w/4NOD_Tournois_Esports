import { z } from 'zod'

const isoDate = z.coerce.date({
  required_error: 'La date est requise',
  invalid_type_error: 'Date invalide',
})

export const tournamentSchema = z
  .object({
    name: z
      .string({ required_error: 'Le nom est requis' })
      .min(1, 'Le nom est requis')
      .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

    game: z
      .string({ required_error: 'Le jeu est requis' })
      .min(1, 'Le jeu est requis')
      .max(100, 'Le jeu ne peut pas dépasser 100 caractères'),

    format: z.enum(['SOLO', 'TEAM'], {
      required_error: 'Le format est requis',
    }),

    maxParticipants: z.coerce
      .number({ required_error: 'Le nombre max de participants est requis' })
      .int('Doit être un entier')
      .min(2, 'Il faut au moins 2 participants'),

    prizePool: z.coerce
      .number({ required_error: 'Le prize pool est requis' })
      .min(0, 'Le prize pool ne peut pas être négatif'),

    startDate: isoDate,

    endDate: isoDate.optional().nullable(),
  })
  .refine(data => !data.endDate || data.endDate > data.startDate, {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
  })

export const tournamentStatusSchema = z.object({
  status: z.enum(['DRAFT', 'OPEN', 'ONGOING', 'COMPLETED', 'CANCELLED'], {
    required_error: 'Le statut est requis',
  }),
})
