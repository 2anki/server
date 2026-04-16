import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, swaggerUiOptions } from '../config/swagger';

const SwaggerRouter = () => {
  const router = express.Router();

  router.get('/api/docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  router.use('/api/docs', swaggerUi.serve);
  router.get('/api/docs', swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  return router;
};

export default SwaggerRouter;
