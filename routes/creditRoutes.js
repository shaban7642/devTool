import express from 'express';
import {
    addCredits,
    buyCredits,
    getAllCreditsHistory,
    getCreditById,
    getMyCreditsHistory,
} from '../controllers/creditController.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
    .route('/')
    .post(protect, addCredits)
    .get(protect, admin, getAllCreditsHistory);

router.route('/mycredits').get(protect, getMyCreditsHistory);

router.route('/:id').get(protect, getCreditById);
router.route('/:id/pay').put(protect, buyCredits);

export default router;
