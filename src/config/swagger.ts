import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '2anki Server API',
      version: '1.2.1',
      description:
        'API documentation for 2anki server - Convert content to Anki flashcards',
      contact: {
        name: '2anki',
        url: 'https://github.com/2anki/server',
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === 'production'
            ? 'https://2anki.net/'
            : 'http://localhost:2020',
        description:
          process.env.NODE_ENV === 'production'
            ? 'Production server'
            : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'session',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            message: {
              type: 'string',
              description: 'Detailed error description',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message',
            },
          },
        },
        Version: {
          type: 'object',
          properties: {
            version: {
              type: 'string',
              description: 'Current API version',
            },
            build: {
              type: 'string',
              description: 'Build information',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
          },
        },
        Upload: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Upload ID',
            },
            filename: {
              type: 'string',
              description: 'Original filename',
            },
            size: {
              type: 'integer',
              description: 'File size in bytes',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Upload timestamp',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

// Custom CSS for swagger UI
export const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #3b82f6; }
  `,
  customSiteTitle: '2anki API Documentation',
  customfavIcon: '/favicon.ico',
};
