import express from 'express';
import { uploadOfficeActionFiles, analyzeOfficeAction, generateFeatureTable } from '../controllers/officeActionController.js';

const router = express.Router();

router.post('/upload', uploadOfficeActionFiles);
router.post('/analyze', analyzeOfficeAction);
router.post('/feature-table', generateFeatureTable);

export default router;