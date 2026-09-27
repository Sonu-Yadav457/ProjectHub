import { Comment } from '../models/Comment.js';
import { Task } from '../models/Task.js';
import { Membership } from '../models/Membership.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Add comment to a task
// @route   POST /api/v1/tasks/:taskId/comments
// @access  Private
export const createComment = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === '') {
    throw new ApiError(400, 'Comment text is required');
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  // Security check: kya user task ke organization ka member hai?
  const membership = await Membership.findOne({
    userId: req.user._id,
    orgId: task.orgId,
  });

  if (!membership) {
    throw new ApiError(403, 'You do not have access to comment on this task');
  }

  const comment = await Comment.create({
    content: content.trim(),
    taskId,
    userId: req.user._id,
  });

  // Populate user details for immediate frontend display
  await comment.populate('userId', 'name email');

  res.status(201).json({
    success: true,
    message: 'Comment posted',
    data: comment,
  });
});

// @desc    Get all comments for a task
// @route   GET /api/v1/tasks/:taskId/comments
// @access  Private
export const getTaskComments = asyncHandler(async (req, res) => {
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
    throw new ApiError(403, 'Access denied');
  }

  const comments = await Comment.find({ taskId })
    .populate('userId', 'name email')
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    count: comments.length,
    data: comments,
  });
});