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
   *               - templates
   *             properties:
   *               templates:
   *                 type: object
   *                 description: Template payload to persist for the user
   *     responses:
   *       200:
   *         description: Template created or updated successfully
   *       400:
   *         description: Invalid template data
   *       401:
   *         description: Authentication required
   */
  router.post('/api/templates/create', RequireAuthentication, (req, res) =>
    controller.createTemplate(req, res)
  );

  /**
   * @swagger
   * /api/templates/delete:
   *   post:
   *     summary: Delete template
   *     description: Delete the template payload owned by the authenticated user
   *     tags: [Templates]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Template deleted successfully
   *       401:
   *         description: Authentication required
   */
  router.post('/api/templates/delete', RequireAuthentication, (req, res) =>
    controller.deleteTemplate(req, res)
  );

  /**
   * @swagger
   * /api/templates/defaults:
   *   get:
   *     summary: List built-in starter note types
   *     description: Returns the curated starter Anki note types shipped with 2anki — used to seed the Note types gallery.
   *     tags: [Templates]
   *     responses:
   *       200:
   *         description: Array of starter note types with previewData
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   */
  router.get('/api/templates/defaults', (req, res) =>
    controller.listDefaultTemplates(req, res)
  );

  /**
   * @swagger
   * /api/templates/official:
   *   get:
   *     summary: List official 2anki note types used by the conversion pipeline
   *     description: Returns the four canonical 2anki templates (Notion Basic, Notion Cloze, Notion Input, Image Occlusion).
   *     tags: [Templates]
   *     responses:
   *       200:
   *         description: Array of official note types
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   */
  router.get('/api/templates/official', (req, res) =>
    controller.listOfficialTemplates(req, res)
  );

  /**
   * @swagger
   * /api/templates/user:
   *   get:
   *     summary: Get the authenticated user's saved template payload
   *     description: Returns `{ templates, hiddenIds }` for the current user, or empty defaults if none saved.
   *     tags: [Templates]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: User's template payload
   *       401:
   *         description: Authentication required
   *       500:
   *         description: Failed to load templates
   */
  router.get('/api/templates/user', RequireAuthentication, (req, res) =>
    controller.getUserData(req, res)
  );

  /**
   * @swagger
   * /api/templates/user:
   *   put:
   *     summary: Save the authenticated user's template payload
   *     description: Persists `{ templates, hiddenIds }` for the current user.
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
   *             properties:
   *               templates:
   *                 type: array
   *               hiddenIds:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       200:
   *         description: Saved
   *       400:
   *         description: Failed to save templates
   *       401:
   *         description: Authentication required
   */
  router.put('/api/templates/user', RequireAuthentication, (req, res) =>
    controller.saveUserData(req, res)
  );

  /**
   * @swagger
   * /api/templates/export:
   *   post:
   *     summary: Export a note type as an Anki package (.apkg)
   *     description: Builds an `.apkg` file from a note type definition plus optional previewData. Returns an attachment download.
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
   *                 description: Anki note type definition (name, tmpls, flds, css)
   *               previewData:
   *                 type: object
   *                 description: Field values for the example card included in the .apkg
   *     responses:
   *       200:
   *         description: .apkg attachment download
   *         content:
   *           application/octet-stream:
   *             schema:
   *               type: string
   *               format: binary
   *       400:
   *         description: Invalid note type
   *       500:
   *         description: Failed to generate APKG
   */
  router.post('/api/templates/export', (req, res) =>
    controller.exportTemplate(req, res)
  );

  return router;
};

export default TemplatesRouter;
