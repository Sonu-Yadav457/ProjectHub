import express from 'express';
import { createComment, getTaskComments } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/')
  .post(createComment)
  .get(getTaskComments);

export default router;