import express from 'express';

import RequireAuthentication from './middleware/RequireAuthentication';
import RulesController from '../controllers/ParserRulesController';
import ParserRulesRepository from '../data_layer/ParserRulesRepository';
import ParserRulesService from '../services/ParserRulesService';
import { getDatabase } from '../data_layer';

const ParserRulesRouter = () => {
  const database = getDatabase();
  const repository = new ParserRulesRepository(database);
  const service = new ParserRulesService(repository);
  const controller = new RulesController(service);
  const router = express.Router();

  /**
   * @swagger
   * /api/rules/find/{id}:
   *   get:
   *     summary: Find parser rule
   *     description: Retrieve a specific parser rule by ID for the authenticated user
   *     tags: [Parser Rules]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Parser rule ID
   *     responses:
   *       200:
   *         description: Parser rule retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: Rule ID
   *                 name:
   *                   type: string
   *                   description: Rule name
   *                 pattern:
   *                   type: string
   *                   description: Regular expression pattern
   *                 replacement:
   *                   type: string
   *                   description: Replacement text
   *                 enabled:
   *                   type: boolean
   *                   description: Whether rule is enabled
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Rule not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/api/rules/find/:id', RequireAuthentication, (req, res) =>
    controller.findRule(req, res)
  );

  /**
   * @swagger
   * /api/rules/create/{id}:
   *   post:
   *     summary: Create parser rule
   *     description: Create a new parser rule for text processing and card generation
   *     tags: [Parser Rules]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Context ID for the rule
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - pattern
   *               - replacement
   *             properties:
   *               name:
   *                 type: string
   *                 description: Rule name
   *               pattern:
   *                 type: string
   *                 description: Regular expression pattern to match
   *               replacement:
   *                 type: string
   *                 description: Replacement text or pattern
   *               enabled:
   *                 type: boolean
   *                 default: true
   *                 description: Whether rule is enabled
   *               priority:
   *                 type: integer
   *                 description: Rule execution priority
   *     responses:
   *       201:
   *         description: Parser rule created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: Created rule ID
   *                 message:
   *                   type: string
   *                   description: Success message
   *       400:
   *         description: Invalid rule data or regex pattern
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
  router.post('/api/rules/create/:id', RequireAuthentication, (req, res) =>
    controller.createRule(req, res)
  );

  return router;
};

export default ParserRulesRouter;
