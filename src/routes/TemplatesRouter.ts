import express from 'express';

import RequireAuthentication from './middleware/RequireAuthentication';
import TemplatesController from '../controllers/TemplatesController';
import TemplatesRepository from '../data_layer/TemplatesRepository';
import { getDatabase } from '../data_layer';
import TemplateService from '../services/TemplatesService';

const TemplatesRouter = () => {
  const router = express.Router();

  const database = getDatabase();
  const controller = new TemplatesController(
    new TemplateService(new TemplatesRepository(database))
  );

  /**
   * @swagger
   * /api/templates/create:
   *   post:
   *     summary: Create template
   *     description: Create a new Anki card template for the authenticated user
   *     tags: [Templates]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - frontTemplate
   *               - backTemplate
   *             properties:
   *               name:
   *                 type: string
   *                 description: Template name
   *               frontTemplate:
   *                 type: string
   *                 description: HTML template for the front of the card
   *               backTemplate:
   *                 type: string
   *                 description: HTML template for the back of the card
   *               css:
   *                 type: string
   *                 description: CSS styling for the template
   *               description:
   *                 type: string
   *                 description: Template description
   *     responses:
   *       201:
   *         description: Template created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: Template ID
   *                 message:
   *                   type: string
   *                   description: Success message
   *       400:
   *         description: Invalid template data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/api/templates/create', RequireAuthentication, (req, res) =>
    controller.createTemplate(req, res)
  );

  /**
   * @swagger
   * /api/templates/delete:
   *   post:
   *     summary: Delete template
   *     description: Delete a template created by the authenticated user
   *     tags: [Templates]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - id
   *             properties:
   *               id:
   *                 type: string
   *                 description: Template ID to delete
   *     responses:
   *       200:
   *         description: Template deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Template not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/api/templates/delete', RequireAuthentication, (req, res) =>
    controller.deleteTemplate(req, res)
  );

  return router;
};

export default TemplatesRouter;
