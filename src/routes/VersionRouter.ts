import express from 'express';
import VersionController from '../controllers/VersionController';
import VersionService from '../services/VersionService';

const VersionRouter = () => {
  const controller = new VersionController(new VersionService());
  const router = express.Router();

  /**
   * @swagger
   * /api/version:
   *   get:
   *     summary: Get API version information
   *     description: Returns the current version and build information of the API
   *     tags: [System]
   *     responses:
   *       200:
   *         description: Version information retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Version'
   *             example:
   *               version: "1.2.1"
   *               build: "2024-08-04"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/api/version', (req, res) => controller.getVersionInfo(req, res));

  return router;
};

export default VersionRouter;
