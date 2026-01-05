import { verifyToken } from '../services/authService.js'

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = verifyToken(token)
    req.user = decoded
    return next()
  } catch {
    return res.status(401).json({ error: 'Token invalide' })
  }
}
