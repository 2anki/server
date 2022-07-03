import express from 'express';

import RequireAuthentication from '../../middleware/RequireAuthentication';
import createTemplate from './createTemplate';
import deleteTemplate from './deleteTemplate';

const router = express.Router();

router.post('/create', RequireAuthentication, createTemplate);
router.post('/delete', RequireAuthentication, deleteTemplate);

export default router;
