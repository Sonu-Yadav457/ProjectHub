import express from 'express';
import {
  createOrganization,
  getMyOrganizations,
  addMemberToOrganization,
} from '../controllers/orgController.js';
import { protect } from '../middleware/authMiddleware.js';
import projectRoutes from './projectRoutes.js'

const router = express.Router();

router.use(protect);

router.use('/:orgId/projects', projectRoutes);

router.route('/')
  .post(createOrganization)
  .get(getMyOrganizations);

router.post('/:orgId/members', addMemberToOrganization);

export default router;