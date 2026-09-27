import { Project } from '../models/Project.js';
import { Membership } from '../models/Membership.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';


export const createProject = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const { name, description } = req.body;

  if (!name || name.trim() === '') {
    throw new ApiError(400, 'Project name is required');
  }

  const membership = await Membership.findOne({
    userId: req.user._id,
    orgId,
  });

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    throw new ApiError(403, 'Only admins or owners can create projects in this organization');
  }

  const project = await Project.create({
    name: name.trim(),
    description: description ? description.trim() : '',
    orgId,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project,
  });
});

export const getOrgProjects = asyncHandler(async (req, res) => {
  const { orgId } = req.params;

  // Verify membership
  const membership = await Membership.findOne({
    userId: req.user._id,
    orgId,
  });

  if (!membership) {
    throw new ApiError(403, 'Access denied: You are not a member of this organization');
  }

  const projects = await Project.find({ orgId })
    .populate('createdBy', 'name email avatarUrl')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects,
  });
});