import express from 'express';

import RequireAuthentication from './middleware/RequireAuthentication';
import RequirePaying from './middleware/RequirePaying';
import NotionController from '../controllers/NotionController';
import NotionRepository from '../data_layer/NotionRespository';
import NotionService from '../services/NotionService';
import { getDatabase } from '../data_layer';

const NotionRouter = () => {
  const router = express.Router();

  const repository = new NotionRepository(getDatabase());
  const controller = new NotionController(new NotionService(repository));

  /**
   * Endpoint for establishing a connection to Notion. We need a token for this.
   * Reference: https://developers.notion.so/
   */
  /**
   * @swagger
   * /api/notion/connect:
   *   get:
   *     summary: Connect to Notion
   *     description: Establish a connection to Notion using OAuth. Redirects to Notion authorization page.
   *     tags: [Notion]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     responses:
   *       302:
   *         description: Redirect to Notion OAuth authorization
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/api/notion/connect', RequireAuthentication, (req, res) =>
    controller.connect(req, res)
  );

  /**
   * @swagger
   * /api/notion/pages:
   *   post:
   *     summary: Search Notion pages
   *     description: Search for pages in the user's connected Notion workspace
   *     tags: [Notion]
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
   *               query:
   *                 type: string
   *                 description: Search query for pages
   *               filter:
   *                 type: object
   *                 description: Filter criteria for pages
   *     responses:
   *       200:
   *         description: Pages found successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 results:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         description: Page ID
   *                       title:
   *                         type: string
   *                         description: Page title
   *                       url:
   *                         type: string
   *                         description: Page URL
   *       401:
   *         description: Authentication required or Notion not connected
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/api/notion/pages', RequireAuthentication, (req, res) =>
    controller.search(req, res)
  );

  /**
   * @swagger
   * /api/notion/get-notion-link:
   *   get:
   *     summary: Get Notion connection link
   *     description: Get the OAuth link to connect to Notion
   *     tags: [Notion]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Notion link retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 link:
   *                   type: string
   *                   format: uri
   *                   description: Notion OAuth authorization URL
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/api/notion/get-notion-link', RequireAuthentication, (req, res) =>
    controller.getNotionLink(req, res)
  );

  /**
   * @swagger
   * /api/notion/convert:
   *   post:
   *     summary: Convert Notion page to Anki
   *     description: Convert a Notion page to Anki flashcards
   *     tags: [Notion]
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
   *               - pageId
   *             properties:
   *               pageId:
   *                 type: string
   *                 description: Notion page ID to convert
   *               options:
   *                 type: object
   *                 description: Conversion options
   *                 properties:
   *                   deckName:
   *                     type: string
   *                     description: Name for the Anki deck
   *                   basicReversed:
   *                     type: boolean
   *                     description: Create reversed cards
   *                   tags:
   *                     type: array
   *                     items:
   *                       type: string
   *                     description: Tags to add to cards
   *     responses:
   *       200:
   *         description: Conversion started successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 jobId:
   *                   type: string
   *                   description: Conversion job ID
   *                 message:
   *                   type: string
   *                   description: Success message
   *       400:
   *         description: Invalid page ID or conversion failed
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
  router.post('/api/notion/convert/', RequireAuthentication, (req, res) =>
    controller.convert(req, res)
  );

  /**
   * @swagger
   * /api/notion/page/{id}:
   *   get:
   *     summary: Get Notion page
   *     description: Retrieve a specific Notion page by ID
   *     tags: [Notion]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Notion page ID
   *     responses:
   *       200:
   *         description: Page retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: Page ID
   *                 title:
   *                   type: string
   *                   description: Page title
   *                 properties:
   *                   type: object
   *                   description: Page properties
   *                 children:
   *                   type: array
   *                   description: Page content blocks
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Page not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/api/notion/page/:id', RequireAuthentication, (req, res) =>
    controller.getPage(req, res)
  );

  /**
   * @swagger
   * /api/notion/blocks/{id}:
   *   get:
   *     summary: Get page blocks
   *     description: Retrieve all blocks from a Notion page
   *     tags: [Notion]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Notion page ID
   *     responses:
   *       200:
   *         description: Blocks retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 results:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         description: Block ID
   *                       type:
   *                         type: string
   *                         description: Block type (paragraph, heading_1, etc.)
   *                       content:
   *                         type: object
   *                         description: Block content
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/api/notion/blocks/:id', RequireAuthentication, (req, res) =>
    controller.getBlocks(req, res)
  );

  /**
   * @swagger
   * /api/notion/block/{id}:
   *   get:
   *     summary: Get specific block
   *     description: Retrieve a specific block by ID
   *     tags: [Notion]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Notion block ID
   *     responses:
   *       200:
   *         description: Block retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: Block ID
   *                 type:
   *                   type: string
   *                   description: Block type
   *                 content:
   *                   type: object
   *                   description: Block content
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Block not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *   post:
   *     summary: Create or update block
   *     description: Create or update a Notion block with new content
   *     tags: [Notion]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Block ID to create or update
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               content:
   *                 type: object
   *                 description: Block content data
   *               type:
   *                 type: string
   *                 description: Block type (paragraph, heading, etc.)
   *     responses:
   *       200:
   *         description: Block created or updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: Block ID
   *                 message:
   *                   type: string
   *                   description: Success message
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Block not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *   delete:
   *     summary: Delete block
   *     description: Delete a Notion block (requires paid subscription)
   *     tags: [Notion]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Block ID to delete
   *     responses:
   *       200:
   *         description: Block deleted successfully
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
   *       403:
   *         description: Paid subscription required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Block not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/api/notion/block/:id', RequireAuthentication, (req, res) =>
    controller.getBlock(req, res)
  );

  router.post('/api/notion/block/:id', RequireAuthentication, (req, res) =>
    controller.createBlock(req, res)
  );

  router.delete('/api/notion/block/:id', RequirePaying, (req, res) =>
    controller.deleteBlock(req, res)
  );

  /**
   * @swagger
   * /api/notion/render-block/{id}:
   *   get:
   *     summary: Render block as HTML
   *     description: Render a Notion block as HTML (requires paid subscription)
   *     tags: [Notion]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Block ID to render
   *     responses:
   *       200:
   *         description: Block rendered successfully
   *         content:
   *           text/html:
   *             schema:
   *               type: string
   *               description: Rendered HTML content
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Paid subscription required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Block not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/api/notion/render-block/:id', RequirePaying, (req, res) =>
    controller.renderBlock(req, res)
  );

  /**
   * @swagger
   * /api/notion/database/{id}:
   *   get:
   *     summary: Get Notion database
   *     description: Retrieve information about a Notion database
   *     tags: [Notion]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Database ID
   *     responses:
   *       200:
   *         description: Database retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: Database ID
   *                 title:
   *                   type: string
   *                   description: Database title
   *                 properties:
   *                   type: object
   *                   description: Database properties/schema
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Database not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/api/notion/database/:id', RequireAuthentication, (req, res) =>
    controller.getDatabase(req, res)
  );

  /**
   * @swagger
   * /api/notion/database/query/{id}:
   *   get:
   *     summary: Query Notion database
   *     description: Query a Notion database to retrieve pages/entries
   *     tags: [Notion]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Database ID to query
   *       - in: query
   *         name: filter
   *         schema:
   *           type: string
   *         description: Filter criteria (JSON string)
   *       - in: query
   *         name: sorts
   *         schema:
   *           type: string
   *         description: Sort criteria (JSON string)
   *       - in: query
   *         name: page_size
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 50
   *         description: Number of results per page
   *     responses:
   *       200:
   *         description: Database queried successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 results:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         description: Page ID
   *                       properties:
   *                         type: object
   *                         description: Page properties
   *                 has_more:
   *                   type: boolean
   *                   description: Whether there are more results
   *                 next_cursor:
   *                   type: string
   *                   description: Cursor for next page
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Database not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get(
    '/api/notion/database/query/:id',
    RequireAuthentication,
    (req, res) => controller.queryDatabase(req, res)
  );

  /**
   * @swagger
   * /api/notion/disconnect:
   *   post:
   *     summary: Disconnect from Notion
   *     description: Disconnect the user's Notion integration and remove stored tokens
   *     tags: [Notion]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Disconnected from Notion successfully
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
   */
  router.post('/api/notion/disconnect', RequireAuthentication, (req, res) =>
    controller.disconnect(req, res)
  );

  return router;
};

export default NotionRouter;
