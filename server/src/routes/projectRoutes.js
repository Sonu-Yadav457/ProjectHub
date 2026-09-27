import express from 'express';
import { createProject, getOrgProjects } from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import taskRoutes from './taskRoutes.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router.use('/:projectId/tasks', taskRoutes);

router.route('/')
  .post(createProject)
  .get(getOrgProjects);

export default router;