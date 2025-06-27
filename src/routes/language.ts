import express from 'express';
import { LanguageController } from '../controllers/LanguageController';

const router = express.Router();

// Change language route
router.get('/change/:lang', LanguageController.changeLanguage);

export default router;
