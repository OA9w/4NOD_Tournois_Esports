import * as authService from '../services/authService.js'

export const register = async (req, res, _next) => {
  try {
    const user = await authService.register(req.body)
    res.status(201).json({
      message: 'Inscription réussie',
      user,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const login = async (req, res, _next) => {
  try {
    const { email, password } = req.body
    const result = await authService.login(email, password)
    res.json({
      message: 'Connexion réussie',
      user: result.user,
      token: result.token,
    })
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
}

export const getProfile = async (req, res, _next) => {
  try {
    const user = await authService.getUserById(req.user.userId)
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
