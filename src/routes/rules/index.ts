import express from 'express';

import RequireAuthentication from '../../middleware/RequireAuthentication';
import createRule from './createRule';
import findRule from './findRule';

const router = express.Router();

router.get('/find/:id', RequireAuthentication, findRule);
router.post('/create/:id', RequireAuthentication, createRule);

export default router;
