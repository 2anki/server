import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, swaggerUiOptions } from '../config/swagger';

const SwaggerRouter = () => {
  const router = express.Router();

  // Serve swagger JSON spec
  router.get('/docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Serve swagger UI
  router.use('/docs', swaggerUi.serve);
  router.get('/docs', swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  return router;
};

export default SwaggerRouter;
