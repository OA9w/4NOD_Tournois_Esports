import { Router } from 'express'
import * as authController from '../controllers/authController.js'
import { authenticate } from '../middlewares/authenticate.js'

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
 *           example: johndoe
 *         email:
 *           type: string
 *           format: email
 *           description: User email
 *           example: john@example.com
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User role
 *           example: user
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update date
 *     RegisterInput:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           minLength: 3
 *           description: Username (unique)
 *           example: johndoe
 *         email:
 *           type: string
 *           format: email
 *           description: Email address (unique)
 *           example: john@example.com
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Password (min 6 characters)
 *           example: secret123
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *           example: john@example.com
 *         password:
 *           type: string
 *           description: Password
 *           example: secret123
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Connexion réussie
 *         user:
 *           $ref: '#/components/schemas/User'
 *         token:
 *           type: string
 *           description: JWT token
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

const router = Router()

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Inscription réussie
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input or email/username already taken
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Cet email est déjà utilisé
 */
router.post('/register', authController.register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user and return JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email ou mot de passe incorrect
 */
router.post('/login', authController.login)

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Token manquant
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Utilisateur non trouvé
 */
router.get('/profile', authenticate, authController.getProfile)

export default router
