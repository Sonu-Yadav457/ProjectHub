import express from 'express';
import {
  createTask,
  getProjectTasks,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

// Nested routes (when mounted under /projects/:projectId/tasks)
router.route('/')
  .post(createTask)
  .get(getProjectTasks);

// Direct routes by Task ID
router.route('/:taskId')
  .patch(updateTask)
  .delete(deleteTask);

export default router;