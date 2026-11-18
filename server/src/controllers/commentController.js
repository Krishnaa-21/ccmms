import { commentService } from '../services/commentService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const addComment = asyncHandler(async (req, res) => {
  const comment = await commentService.addComment(req.params.id, req.body, req.user);
  res.status(201).json({
    success: true,
    message: 'Comment posted successfully',
    data: comment
  });
});

export const getComments = asyncHandler(async (req, res) => {
  const comments = await commentService.getComments(req.params.id, req.user);
  res.json({
    success: true,
    data: comments
  });
});

export default {
  addComment,
  getComments
};
