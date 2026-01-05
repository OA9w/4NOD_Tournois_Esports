export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.status || err.statusCode || 500

  if (statusCode >= 500) {
    console.error('Error:', err)
  } else {
    console.warn('Request error:', err.message)
  }

  if (req.originalUrl.startsWith('/api/')) {
    return res.status(statusCode).json({
      success: false,
      error: err.message || 'Erreur serveur',
    })
  }

  return res.status(statusCode).render('pages/error', {
    title: 'Erreur',
    message: err.message || 'Une erreur est survenue.',
  })
}
