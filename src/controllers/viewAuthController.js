import * as authService from '../services/authService.js'

export const showLoginPage = (req, res) => {
  if (req.session?.user) {
    return res.redirect('/')
  }
  res.render('pages/auth/login', {
    error: req.query.error,
    success: req.query.success,
  })
}

export const showRegisterPage = (req, res) => {
  if (req.session?.user) {
    return res.redirect('/')
  }
  res.render('pages/auth/register', { error: null })
}

export const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await authService.login(email, password)

    req.session.user = result.user
    req.session.token = result.token

    res.redirect('/')
  } catch (error) {
    res.render('pages/auth/login', {
      error: error.message,
      success: null,
    })
  }
}

export const handleRegister = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body

    if (password !== confirmPassword) {
      return res.render('pages/auth/register', {
        error: 'Les mots de passe ne correspondent pas',
      })
    }

    await authService.register({ username, email, password })

    res.redirect('/auth/login?success=Inscription reussie ! Connectez-vous.')
  } catch (error) {
    res.render('pages/auth/register', {
      error: error.message,
    })
  }
}

export const logout = (req, res) => {
  req.session.destroy()
  res.redirect('/')
}
