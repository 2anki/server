import express from 'express';

import RequireAuthentication from './middleware/RequireAuthentication';
import TemplatesController from '../controllers/TemplatesController';
import TemplatesRepository from '../data_layer/TemplatesRepository';
import PublicTemplatesRepository from '../data_layer/PublicTemplatesRepository';
import PublicTemplatesController from '../controllers/PublicTemplatesController';
import { getDatabase } from '../data_layer';
import { TemplateService } from '../services/TemplatesService/TemplateService';

const TemplatesRouter = () => {
  const router = express.Router();

  const database = getDatabase();
  const controller = new TemplatesController(
    new TemplateService(new TemplatesRepository(database))
  );
  const publicController = new PublicTemplatesController(
    new PublicTemplatesRepository(database)
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

  /**
   * @swagger
   * /api/templates/export:
   *   post:
   *     summary: Export template as APKG
   *     description: Generate and download an Anki package file from a note type definition
   *     tags: [Templates]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - noteType
   *             properties:
   *               noteType:
   *                 type: object
   *                 description: Anki note type definition
   *               previewData:
   *                 type: object
   *                 description: Field values for the example card
   *     responses:
   *       200:
   *         description: APKG file download
   *         content:
   *           application/octet-stream:
   *             schema:
   *               type: string
   *               format: binary
   *       400:
   *         description: Invalid note type data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/api/templates/export', (req, res) =>
    controller.exportTemplate(req, res)
  );

  /**
   * @swagger
   * /api/templates/public:
   *   get:
   *     summary: List public templates
   *     description: Returns all community-shared Anki note type templates
   *     tags: [Templates]
   *     responses:
   *       200:
   *         description: List of public templates
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                   ownerName:
   *                     type: string
   *                   name:
   *                     type: string
   *                   description:
   *                     type: string
   *                   noteType:
   *                     type: object
   *                   tags:
   *                     type: array
   *                     items:
   *                       type: string
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/api/templates/public', (req, res) =>
    publicController.list(req, res)
  );

  /**
   * @swagger
   * /api/templates/publish:
   *   post:
   *     summary: Publish a template
   *     description: Share a template publicly to the community marketplace
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
   *               - noteType
   *             properties:
   *               name:
   *                 type: string
   *                 description: Template name
   *               description:
   *                 type: string
   *                 description: Template description
   *               noteType:
   *                 type: object
   *                 description: Anki note type definition
   *               previewData:
   *                 type: object
   *                 description: Field values for the example card
   *               tags:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Searchable tags
   *     responses:
   *       201:
   *         description: Template published successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       400:
   *         description: Missing required fields
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
  router.post('/api/templates/publish', RequireAuthentication, (req, res) =>
    publicController.publish(req, res)
  );

  return router;
};

export default TemplatesRouter;
