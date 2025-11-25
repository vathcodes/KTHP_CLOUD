import express from 'express';
import { createFood, getFoods, updateFood, deleteFood } from '../controllers/foodController.js';
import { protect, admin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, admin, upload.single('image'), createFood);

router.get('/', protect, getFoods);

router.put('/:id', protect, admin, upload.single('image'), updateFood);

router.delete('/:id', protect, admin, deleteFood);

export default router;
