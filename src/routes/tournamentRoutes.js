import express from 'express'
import * as tournamentController from '../controllers/tournamentController.js'
import {
  tournamentSchema,
  tournamentStatusSchema,
} from '../schemas/tournamentSchema.js'
import { validate } from '../middlewares/validate.js'
import { authenticate } from '../middlewares/authenticate.js'
import { authorize } from '../middlewares/authorize.js'

/**
 * @swagger
 * components:
 *   schemas:
 *     Tournament:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - game
 *         - format
 *         - maxParticipants
 *         - prizePool
 *         - startDate
 *         - status
 *         - organizerId
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Winter Cup
 *         game:
 *           type: string
 *           example: Counter-Strike 2
 *         format:
 *           type: string
 *           enum: [SOLO, TEAM]
 *           example: TEAM
 *         maxParticipants:
 *           type: integer
 *           example: 16
 *         prizePool:
 *           type: number
 *           format: float
 *           example: 500.0
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: 2026-01-10T10:00:00.000Z
 *         endDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: 2026-01-12T18:00:00.000Z
 *         status:
 *           type: string
 *           enum: [DRAFT, OPEN, ONGOING, COMPLETED, CANCELLED]
 *           example: DRAFT
 *         organizerId:
 *           type: integer
 *           example: 3
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     TournamentInput:
 *       type: object
 *       required:
 *         - name
 *         - game
 *         - format
 *         - maxParticipants
 *         - prizePool
 *         - startDate
 *       properties:
 *         name:
 *           type: string
 *           example: Winter Cup
 *         game:
 *           type: string
 *           example: Counter-Strike 2
 *         format:
 *           type: string
 *           enum: [SOLO, TEAM]
 *           example: TEAM
 *         maxParticipants:
 *           type: integer
 *           example: 16
 *         prizePool:
 *           type: number
 *           format: float
 *           example: 500.0
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: 2026-01-10T10:00:00.000Z
 *         endDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: 2026-01-12T18:00:00.000Z
 *
 *     TournamentStatusInput:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [DRAFT, OPEN, ONGOING, COMPLETED, CANCELLED]
 *           example: OPEN
 *
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: Tournoi introuvable
 *
 *     Success:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 */

const router = express.Router()

/**
 * @swagger
 * /api/tournaments:
 *   get:
 *     summary: List all tournaments
 *     description: Retrieve tournaments with optional filters and pagination
 *     tags: [Tournaments]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, OPEN, ONGOING, COMPLETED, CANCELLED]
 *         description: Filter by status
 *       - in: query
 *         name: game
 *         schema:
 *           type: string
 *         description: Filter by game name
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [SOLO, TEAM]
 *         description: Filter by format
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Page size
 *     responses:
 *       200:
 *         description: List of tournaments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     count:
 *                       type: integer
 *                       example: 10
 *                     tournaments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tournament'
 */
router.get('/', tournamentController.getAll)

/**
 * @swagger
 * /api/tournaments/{id}:
 *   get:
 *     summary: Get tournaments by ID
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tournament found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tournament'
 *       404:
 *         description: Tournament not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', tournamentController.getById)

/**
 * @swagger
 * /api/tournaments:
 *   post:
 *     summary: Create a tournaments
 *     description: ORGANIZER or ADMIN only. Status is forced to DRAFT.
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TournamentInput'
 *     responses:
 *       201:
 *         description: Tournament created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tournament'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  validate(tournamentSchema),
  tournamentController.create
)

/**
 * @swagger
 * /api/tournaments/{id}:
 *   put:
 *     summary: Update a tournaments
 *     description: ORGANIZER or ADMIN only.
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TournamentInput'
 *     responses:
 *       200:
 *         description: Tournament updated
 *       400:
 *         description: Invalid input / business rule
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Tournament not found
 */
router.put(
  '/:id',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  validate(tournamentSchema),
  tournamentController.update
)

/**
 * @swagger
 * /api/tournaments/{id}:
 *   delete:
 *     summary: Delete a tournaments
 *     description: ORGANIZER or ADMIN only. Cannot delete if it has CONFIRMED registrations.
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Tournament deleted
 *       400:
 *         description: Business rule prevents deletion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Tournament not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  tournamentController.remove
)

/**
 * @swagger
 * /api/tournaments/{id}/status:
 *   patch:
 *     summary: Update tournaments status
 *     description: Handles allowed status transitions.
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TournamentStatusInput'
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid transition / business rule
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Tournament not found
 */
router.patch(
  '/:id/status',
  authenticate,
  validate(tournamentStatusSchema),
  tournamentController.updateStatus
)

export default router
