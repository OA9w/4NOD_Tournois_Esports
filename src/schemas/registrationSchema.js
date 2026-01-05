import { z } from 'zod'

/**
 * @swagger
 * components:
 *   schemas:
 *     RegistrationCreateInput:
 *       type: object
 *       description: For TEAM tournaments, provide teamId. For SOLO, leave empty.
 *       properties:
 *         teamId:
 *           type: integer
 *           example: 2
 *     RegistrationStatusInput:
 *       type: object
 *       required: [status]
 *       properties:
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, REJECTED, WITHDRAWN]
 *           example: CONFIRMED
 */

export const registerSchema = z.object({
  // TEAM uniquement (si tournoi TEAM). La cohérence format se fait dans le service.
  teamId: z.coerce.number().int().positive().optional(),
})

export const updateRegistrationStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'REJECTED', 'WITHDRAWN'], {
    required_error: 'Le statut est requis',
  }),
})
