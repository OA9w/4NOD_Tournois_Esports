import express from 'express'
import * as registrationController from '../controllers/registrationController.js'
import { authenticate } from '../middlewares/authenticate.js'
import { validate } from '../middlewares/validate.js'
import {
  registerSchema,
  updateRegistrationStatusSchema,
} from '../schemas/registrationSchema.js'

/**
 * @swagger
 * tags:
 *   name: Registrations
 *   description: Tournament registrations (SOLO/TEAM)
 */

const router = express.Router({ mergeParams: true })

/**
 * @swagger
 * /api/tournaments/{tournamentId}/register:
 *   post:
 *     summary: Register to a tournaments (SOLO or TEAM)
 *     description: |
 *       - Tournament must be OPEN
 *       - SOLO: registers current user as player
 *       - TEAM: requires teamId and current user must be the captain
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistrationCreateInput'
 *     responses:
 *       201:
 *         description: Registration created
 *       400:
 *         description: Business rule / invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden (e.g. not captain)
 *       404:
 *         description: Tournament or teams not found
 */
router.post(
  '/register',
  authenticate,
  validate(registerSchema),
  registrationController.register
)

/**
 * @swagger
 * /api/tournaments/{tournamentId}/registrations:
 *   get:
 *     summary: List registrations for a tournaments
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of registrations
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Tournament not found
 */
router.get('/registrations', authenticate, registrationController.list)

/**
 * @swagger
 * /api/tournaments/{tournamentId}/registrations/{id}:
 *   patch:
 *     summary: Update a registrations status (organizer or participant)
 *     description: |
 *       - Organizer or participant can update
 *       - CONFIRMED sets confirmedAt
 *       - Cannot confirm if maxParticipants reached
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistrationStatusInput'
 *     responses:
 *       200:
 *         description: Registration updated
 *       400:
 *         description: Business rule / invalid transition
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.patch(
  '/registrations/:id',
  authenticate,
  validate(updateRegistrationStatusSchema),
  registrationController.updateStatus
)

/**
 * @swagger
 * /api/tournaments/{tournamentId}/registrations/{id}:
 *   delete:
 *     summary: Cancel a registrations (only if PENDING)
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Registration deleted
 *       400:
 *         description: Only PENDING can be deleted
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.delete('/registrations/:id', authenticate, registrationController.remove)

export default router
