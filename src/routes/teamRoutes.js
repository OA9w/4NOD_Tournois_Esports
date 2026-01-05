import express from 'express'
import * as teamController from '../controllers/teamController.js'
import { teamSchema } from '../schemas/teamSchema.js'
import { validate } from '../middlewares/validate.js'
import { authenticate } from '../middlewares/authenticate.js'

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Team management
 *
 * components:
 *   schemas:
 *     UserPublic:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 5 }
 *         username: { type: string, example: playerOne }
 *         email: { type: string, example: player@site.com }
 *         role: { type: string, example: PLAYER }
 *
 *     Team:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         name: { type: string, example: Team Alpha }
 *         tag: { type: string, example: ALPHA }
 *         captainId: { type: integer, example: 5 }
 *         captain:
 *           $ref: '#/components/schemas/UserPublic'
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *
 *     TeamInput:
 *       type: object
 *       required: [name, tag]
 *       properties:
 *         name: { type: string, example: Team Alpha }
 *         tag: { type: string, example: ALPHA }
 *
 *     Error:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: false }
 *         error: { type: string, example: Accès interdit }
 */

const router = express.Router()

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: List all teams
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: List of teams
 */
router.get('/', teamController.getAll)

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get teams by ID (with captain)
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Team found
 *       404:
 *         description: Team not found
 */
router.get('/:id', teamController.getById)

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Create a teams (authenticated user becomes captain)
 *     description: The authenticated user becomes the teams captain (must be PLAYER).
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeamInput'
 *     responses:
 *       201:
 *         description: Team created
 *       400:
 *         description: Invalid input / business rule
 *       401:
 *         description: Not authenticated
 */
router.post('/', authenticate, validate(teamSchema), teamController.create)

/**
 * @swagger
 * /api/teams/{id}:
 *   put:
 *     summary: Update a teams
 *     description: Captain only.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeamInput'
 *     responses:
 *       200:
 *         description: Team updated
 *       400:
 *         description: Invalid input / business rule
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden (not captain)
 *       404:
 *         description: Team not found
 */
router.put('/:id', authenticate, validate(teamSchema), teamController.update)

/**
 * @swagger
 * /api/teams/{id}:
 *   delete:
 *     summary: Delete a teams
 *     description: Captain only. Cannot delete if registered to an active tournaments (OPEN/ONGOING).
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Team deleted
 *       400:
 *         description: Business rule prevents deletion
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden (not captain)
 *       404:
 *         description: Team not found
 */
router.delete('/:id', authenticate, teamController.remove)

export default router
