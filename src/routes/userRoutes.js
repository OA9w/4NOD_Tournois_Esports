import express from 'express'
import * as userController from '../controllers/userController.js'
import { authenticate } from '../middlewares/authenticate.js'
import { authorize } from '../middlewares/authorize.js'

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique user ID
 *           example: 1
 *         username:
 *           type: string
 *           description: Username
 *           example: admin
 *         email:
 *           type: string
 *           format: email
 *           description: User email
 *           example: admin@lanparty.com
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User role
 *           example: admin
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update date
 */

const router = express.Router()

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users (admin only)
 *     description: Retrieve all users. Requires admin role.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
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
 *                       example: 4
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticate, authorize('admin'), userController.getAll)

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     description: Remove a user from the system. Requires admin role. Cannot delete yourself.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       400:
 *         description: Cannot delete your own account
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
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticate, authorize('admin'), userController.remove)

export default router
