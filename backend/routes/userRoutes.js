import express from 'express';
import {
  getAllUsers,
  toggleBlockUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(admin);

router.route('/')
  .get(getAllUsers);

router.route('/:id/block')
  .put(toggleBlockUser);

router.route('/:id')
  .delete(deleteUser);

export default router;
