import { z } from 'zod'

export const teamSchema = z.object({
  name: z
    .string({ required_error: "Le nom est requis" })
    .min(3, 'Le nom doit faire au moins 3 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),

  tag: z
    .string({ required_error: 'Le tag est requis' })
    .min(3, 'Le tag doit faire 3 caractères minimum')
    .max(5, 'Le tag ne peut pas dépasser 5 caractères')
    .regex(/^[A-Z0-9]+$/, 'Le tag doit contenir uniquement des MAJUSCULES et chiffres'),
})
