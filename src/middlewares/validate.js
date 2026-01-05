/**
 * Validation middleware factory using Zod
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */
export const validate = schema => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const errors = result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))

      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          errors,
        })
      }

      res.locals.errors = errors
      res.locals.formData = req.body
      return next()
    }

    req.body = result.data
    return next()
  }
}
