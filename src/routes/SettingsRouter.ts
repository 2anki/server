import express from 'express';

import RequireAuthentication from './middleware/RequireAuthentication';
import CardOptionsController from '../controllers/CardOptionsController/CardOptionsController';
import SettingsRepository from '../data_layer/SettingsRepository';
import ParserRulesRepository from '../data_layer/ParserRulesRepository';
import NotionRepository from '../data_layer/NotionRespository';
import NotionTopLevelPagesRepository from '../data_layer/NotionTopLevelPagesRepository';
import { getDatabase } from '../data_layer';
import SettingsService from '../services/SettingsService';
import NotionService from '../services/NotionService';
import DeleteAllUserSettingsUseCase from '../usecases/DeleteAllUserSettingsUseCase';

const SettingsRouter = () => {
  const router = express.Router();
  const database = getDatabase();
  const notionService = new NotionService(
    new NotionRepository(database),
    new NotionTopLevelPagesRepository(database)
  );
  const settingsRepository = new SettingsRepository(database);
  const parserRulesRepository = new ParserRulesRepository(database);
  const controller = new CardOptionsController(
    new SettingsService(settingsRepository),
    notionService,
    new DeleteAllUserSettingsUseCase(settingsRepository, parserRulesRepository)
  );

  /**
   * @swagger
   * /api/settings/create/{id}:
   *   post:
   *     summary: Create user setting
   *     description: Create a new setting configuration for the authenticated user
   *     tags: [Settings]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Setting context ID (upload, template, etc.)
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               cardOptions:
   *                 type: object
   *                 description: Card formatting and generation options
   *               conversionOptions:
   *                 type: object
   *                 description: Content conversion preferences
   *               templateSettings:
   *                 type: object
   *                 description: Template-specific settings
   *     responses:
   *       201:
   *         description: Setting created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: Setting ID
   *                 message:
   *                   type: string
   *                   description: Success message
   *       400:
   *         description: Invalid setting data
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
  router.post('/api/settings/create/:id', RequireAuthentication, (req, res) =>
    controller.createSetting(req, res)
  );

  /**
   * @swagger
   * /api/settings/delete/{id}:
   *   post:
   *     summary: Delete user setting
   *     description: Delete a specific setting configuration for the authenticated user
   *     tags: [Settings]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Setting ID to delete
   *     responses:
   *       200:
   *         description: Setting deleted successfully
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
   *         description: Setting not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/api/settings/delete/:id', RequireAuthentication, (req, res) =>
    controller.deleteSetting(req, res)
  );

  /**
   * @swagger
   * /api/settings/find/{id}:
   *   get:
   *     summary: Find user setting
   *     description: Retrieve a specific setting configuration for the authenticated user
   *     tags: [Settings]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Setting ID to retrieve
   *     responses:
   *       200:
   *         description: Setting retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: Setting ID
   *                 cardOptions:
   *                   type: object
   *                   description: Card formatting options
   *                 conversionOptions:
   *                   type: object
   *                   description: Content conversion preferences
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Setting not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/api/settings/find/:id', RequireAuthentication, (req, res) =>
    controller.findSetting(req, res)
  );

  /**
   * @swagger
   * /api/settings/default:
   *   get:
   *     summary: Get default settings
   *     description: Retrieve the default card options and conversion settings
   *     tags: [Settings]
   *     responses:
   *       200:
   *         description: Default settings retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 cardOptions:
   *                   type: object
   *                   description: Default card formatting options
   *                 conversionOptions:
   *                   type: object
   *                   description: Default conversion settings
   */
  router.get('/api/settings/default', (_req, res) => {
    const defaultOptions = controller.getDefaultCardOptions('client');
    res.json(defaultOptions);
  });

  /**
   * @swagger
   * /api/settings/card-options:
   *   get:
   *     summary: Get card option details
   *     description: Retrieve detailed information about available card options and their configurations
   *     tags: [Settings]
   *     responses:
   *       200:
   *         description: Card option details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 options:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       name:
   *                         type: string
   *                         description: Option name
   *                       type:
   *                         type: string
   *                         description: Option data type
   *                       description:
   *                         type: string
   *                         description: Option description
   *                       defaultValue:
   *                         description: Default value for the option
   */
  router.get('/api/settings/card-options', (_req, res) => {
    const defaultOptions = controller.getDefaultCardOptionDetails();
    res.json(defaultOptions);
  });

  /**
   * @swagger
   * /api/settings/list:
   *   get:
   *     summary: List per-page settings
   *     description: Retrieve all per-page setting overrides for the authenticated user, including page title and last-updated timestamp.
   *     tags: [Settings]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Per-page settings retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 items:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       pageId:
   *                         type: string
   *                         description: Notion page ID
   *                       title:
   *                         type: string
   *                         nullable: true
   *                         description: Page title resolved from Notion, if known
   *                       updatedAt:
   *                         type: string
   *                         nullable: true
   *                         format: date-time
   *                         description: Timestamp of the most recent override save
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/api/settings/list', RequireAuthentication, (req, res) =>
    controller.listSettings(req, res)
  );

  /**
   * @swagger
   * /api/users/me/settings:
   *   delete:
   *     summary: Reset all saved per-page settings
   *     description: Owner-scoped wipe of every per-page parser rule and per-page card-option override for the authenticated user. Idempotent — returns 204 even when the user has no saved pages.
   *     tags: [Settings]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     responses:
   *       204:
   *         description: Saved per-page settings reset (or already empty)
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.delete('/api/users/me/settings', RequireAuthentication, (req, res) =>
    controller.deleteAllUserSettings(req, res)
  );

  return router;
};

export default SettingsRouter;
