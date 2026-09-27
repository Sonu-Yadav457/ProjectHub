import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { Membership } from '../models/Membership.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createTask = asyncHandler(async (req,res) => {
    const {projectId} = req.params;
    const {title, description, priority,dueDate,assigneeId} = req.body;

    if(!title || title.trim() === ''){
        throw new ApiError(400,'Task title is required');
    }

    const project = await Project.findById(projectId);
    if(!project){
        throw new ApiError(404,'Project not found');
    }

    const membership = await Membership.findOne({
    userId: req.user._id,
    orgId: project.orgId,
  });

  if (!membership) {
    throw new ApiError(403, 'You do not have permission to add tasks in this project');
  }

  const task = await Task.create({
    title: title.trim(),
    description: description ? description.trim() : '',
    projectId,
    orgId: project.orgId,
    priority: priority || 'medium',
    dueDate: dueDate || null,
    assigneeId: assigneeId || null,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task,
  });
})

//Get all tasks for a project (For Kanban / List view)

export const getProjectTasks = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const membership = await Membership.findOne({
    userId: req.user._id,
    orgId: project.orgId,
  });

  if (!membership) {
    throw new ApiError(403, 'Access denied: You are not a member of this organization');
  }

  const tasks = await Task.find({ projectId })
    .populate('assigneeId', 'name email avatarUrl')
    .populate('createdBy', 'name email')
    .sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
})

export const updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
  const updates = req.body;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const membership = await Membership.findOne({
    userId: req.user._id,
    orgId: task.orgId,
  });

  if (!membership) {
    throw new ApiError(403, 'You are not authorized to update tasks in this workspace');
  }

  if (membership.role === 'viewer') {
    throw new ApiError(403, 'Viewers do not have edit permissions');
  }

  const allowedUpdates = ['title', 'description', 'status', 'priority', 'assigneeId', 'dueDate', 'order'];
  allowedUpdates.forEach((field) => {
    if (updates[field] !== undefined) {
      task[field] = updates[field];
    }
  });

  await task.save();

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task,
  });
})

export const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const membership = await Membership.findOne({
    userId: req.user._id,
    orgId: task.orgId,
  });

  if (!membership) {
    throw new ApiError(403, 'Unauthorized access');
  }

  const isCreator = task.createdBy.toString() === req.user._id.toString();
  const isAdminOrOwner = ['owner', 'admin'].includes(membership.role);

  if (!isCreator && !isAdminOrOwner) {
    throw new ApiError(403, 'You do not have permission to delete this task');
  }

  await task.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
})