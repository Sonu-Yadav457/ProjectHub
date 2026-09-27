import express from 'express';
import {
  createOrganization,
  getMyOrganizations,
  addMemberToOrganization,
} from '../controllers/orgController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createOrganization)
  .get(getMyOrganizations);

router.post('/:orgId/members', addMemberToOrganization);

export default router;