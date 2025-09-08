"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const FavoritesController_1 = __importDefault(require("../controllers/FavoritesController"));
const data_layer_1 = require("../data_layer");
const FavoritesRepository_1 = require("../data_layer/FavoritesRepository");
const FavoriteService_1 = __importDefault(require("../services/FavoriteService"));
const RequireAuthentication_1 = __importDefault(require("./middleware/RequireAuthentication"));
const FavoriteRouter = () => {
    const router = express_1.default.Router();
    const controller = new FavoritesController_1.default(new FavoriteService_1.default(new FavoritesRepository_1.FavoritesRepository((0, data_layer_1.getDatabase)())));
    /**
     * @swagger
     * /api/favorite/create:
     *   post:
     *     summary: Create favorite
     *     description: Add a new item to the user's favorites list
     *     tags: [Favorites]
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
     *               - type
     *               - data
     *             properties:
     *               type:
     *                 type: string
     *                 enum: [upload, template, notion_page]
     *                 description: Type of item to favorite
     *               data:
     *                 type: object
     *                 description: Data about the favorite item
     *               title:
     *                 type: string
     *                 description: Display title for the favorite
     *     responses:
     *       201:
     *         description: Favorite created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: integer
     *                   description: Favorite ID
     *                 message:
     *                   type: string
     *                   description: Success message
     *       400:
     *         description: Invalid request data
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
    router.post('/api/favorite/create', RequireAuthentication_1.default, (req, res) => controller.createFavorite(req, res));
    /**
     * @swagger
     * /api/favorite/remove:
     *   post:
     *     summary: Remove favorite
     *     description: Remove an item from the user's favorites list
     *     tags: [Favorites]
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
     *                 type: integer
     *                 description: Favorite ID to remove
     *     responses:
     *       200:
     *         description: Favorite removed successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Success'
     *       400:
     *         description: Invalid favorite ID
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
     *       404:
     *         description: Favorite not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.post('/api/favorite/remove', RequireAuthentication_1.default, (req, res) => controller.deleteFavorite(req, res));
    /**
     * @swagger
     * /api/favorite:
     *   get:
     *     summary: Get user favorites
     *     description: Retrieve all favorite items for the authenticated user
     *     tags: [Favorites]
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     responses:
     *       200:
     *         description: Favorites retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: integer
     *                     description: Favorite ID
     *                   type:
     *                     type: string
     *                     enum: [upload, template, notion_page]
     *                     description: Type of favorite item
     *                   title:
     *                     type: string
     *                     description: Display title
     *                   data:
     *                     type: object
     *                     description: Item data
     *                   created_at:
     *                     type: string
     *                     format: date-time
     *                     description: When the favorite was created
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.get('/api/favorite', RequireAuthentication_1.default, (request, response) => {
        controller.getFavorites(request, response);
    });
    return router;
};
exports.default = FavoriteRouter;
//# sourceMappingURL=FavoriteRouter.js.map