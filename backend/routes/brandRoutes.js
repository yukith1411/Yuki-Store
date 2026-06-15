import express from 'express';
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/brandController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getBrands)
  .post(protect, admin, upload.single('logo'), createBrand);

router.route('/:id')
  .put(protect, admin, upload.single('logo'), updateBrand)
  .delete(protect, admin, deleteBrand);

export default router;
