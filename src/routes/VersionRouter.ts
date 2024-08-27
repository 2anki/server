import express from 'express';
import VersionController from '../controllers/VersionController';
import VersionService from '../services/VersionService';

const VersionRouter = () => {
  const controller = new VersionController(new VersionService());
  const router = express.Router();

  /**
   * @openapi
   * /api/version:
   *  get:
   *    description: Get the version of the API
   *    responses:
   *      '200':
   *        description: A successful response
   *        content:
   *          application/text:
   *            schema:
   *              type: string
   *              example: "Notion to Anki v1.0.0"
   */
  router.get('/api/version', (req, res) => controller.getVersionInfo(req, res));

  return router;
};

export default VersionRouter;
