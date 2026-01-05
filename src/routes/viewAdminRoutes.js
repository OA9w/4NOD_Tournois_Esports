import express from 'express'
import * as viewAdminController from '../controllers/viewAdminController.js'

const router = express.Router()

// Middleware pour vérifier l'authentification et le rôle admin (session)
const requireAdmin = (req, res, next) => {
  if (!req.session?.user) {
    return res.redirect('/auth/login')
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).render('pages/error', {
      title: 'Acces interdit',
      error: { status: 403, message: 'Acces reserve aux administrateurs' },
    })
  }
  next()
}

router.use(requireAdmin)

router.get('/users', viewAdminController.showUsersPage)
router.post('/users/:id/delete', viewAdminController.deleteUser)

export default router
