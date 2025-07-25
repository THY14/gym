import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'GYM Management API',
    version: '1.0.0',
    description: 'API documentation for GYM Management System',
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{
    bearerAuth: []
  }]
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/controllers/*.js'], // Adjust path if needed
};

const swaggerSpec = swaggerJSDoc(options);

export const serveSwagger = swaggerUi.serve;
export const setupSwagger = swaggerUi.setup(swaggerSpec);
