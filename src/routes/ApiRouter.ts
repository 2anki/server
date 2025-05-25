import express from 'express';
import { ApiDeckController } from '../controllers/ApiDeckController';

export default function apiRouter() {
    const router = express.Router();
    const apiDeckController = new ApiDeckController();

    // Route for POST /api/v1/decks
    // The /v1 prefix will be handled when mounting this router in server.ts
    router.post('/v1/decks', (req, res) => apiDeckController.createDeck(req, res));

    return router;
}
