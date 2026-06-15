import express from 'express';
import {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getActiveBanners);

router.route('/all')
  .get(protect, admin, getAllBanners);

router.route('/')
  .post(protect, admin, upload.single('image'), createBanner);

router.route('/:id')
  .put(protect, admin, upload.single('image'), updateBanner)
  .delete(protect, admin, deleteBanner);

export default router;
