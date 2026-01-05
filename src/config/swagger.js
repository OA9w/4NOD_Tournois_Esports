import swaggerJsDoc from 'swagger-jsdoc'

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-sport Tournament Manager API',
      version: '1.0.0',
      description:
        'API REST pour la gestion de tournois e-sport, des équipes et des inscriptions',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },

  // Swagger va scanner tous les fichiers de routes
  apis: ['./src/routes/*.js'],
}

export const swaggerSpec = swaggerJsDoc(swaggerOptions)
