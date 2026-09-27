import express from 'express';
import {
  createOrganization,
  getMyOrganizations,
  addMemberToOrganization,
  getOrgMembers,
  removeMemberFromOrg
} from '../controllers/orgController.js';
import { protect } from '../middleware/authMiddleware.js';
import projectRoutes from './projectRoutes.js'

const router = express.Router();

router.use(protect);

router.use('/:orgId/projects', projectRoutes);

router.route('/')
  .post(createOrganization)
  .get(getMyOrganizations);

router.route('/:orgId/members')
  .get(getOrgMembers)
  .post(addMemberToOrganization);

router.route('/:orgId/members/:membershipId')
  .delete(removeMemberFromOrg);
export default router;