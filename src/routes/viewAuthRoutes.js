import express from 'express'
import * as viewAuthController from '../controllers/viewAuthController.js'

const router = express.Router()

router.get('/login', viewAuthController.showLoginPage)
router.post('/login', viewAuthController.handleLogin)

router.get('/register', viewAuthController.showRegisterPage)
router.post('/register', viewAuthController.handleRegister)

router.get('/logout', viewAuthController.logout)

export default router
