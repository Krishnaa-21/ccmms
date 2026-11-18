import express from 'express';
import { getApiDocs } from '../controllers/docsController.js';

const router = express.Router();

router.get('/docs', getApiDocs);

export default router;
