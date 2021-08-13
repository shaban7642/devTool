import express from 'express';
import {
    authUser,
    deleteUser,
    forgotPassword,
    getUserById,
    getUserProfile,
    getUsers,
    registerUser,
    resetPassword,
    updateUser,
    updateUserProfile,
    updateUserToBlocked,
    updateUserToUnblocked,
    verifyEmail,
} from '../controllers/userController.js';

import { admin, protect } from '../middleware/authMiddleware.js';
import sendMail from '../utils/sendMail.js';

const router = express.Router();

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.route('/login').post(authUser);
router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);
router
    .route('/:id')
    .delete(protect, admin, deleteUser)
    .get(protect, admin, getUserById)
    .put(protect, admin, updateUser);

router.route('/:id/block').put(protect, admin, updateUserToBlocked);
router.route('/:id/unblock').put(protect, admin, updateUserToUnblocked);

router.post('/mail', sendMail);
router.route('/verify-email/:emailToken').get(verifyEmail);

router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:resettoken').put(resetPassword);

// router
//     .route('/credits/cr')
//     .put(protect, buyCredits)
//     .get(protect, admin, getAllCreditsHistory);
// router.route('/credits/mycredits').get(protect, getMyCreditsHistory);

export default router;
