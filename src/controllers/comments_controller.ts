import commentsModel, { iComment } from "../models/comments_model";
import BaseController from "./base_controller";
import { Request, Response } from "express";
import postModel from "../models/posts_model";

class CommentsController extends BaseController<iComment> {
  constructor() {
    super(commentsModel);
  }

  async create(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const fullComment = { ...req.body, sender: userId };
      req.body = fullComment;

      await super.create(req, res);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment", error });
    }
  }

  async getCommentsByPost(req: Request, res: Response) {
    try {
      const postId = req.params.postId;
      const comments = await commentsModel.find({ postId });

      if (!comments.length) {
        return res
          .status(404)
          .json({ message: "No comments found for this post" });
      }

      res.status(200).json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }

  async updateComment(req: Request, res: Response) {
    try {
      const commentId = req.params.id;
      const { content } = req.body;

      const updated = await commentsModel.findByIdAndUpdate(
        commentId,
        { content },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Comment not found" });
      }

      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update comment", error });
    }
  }

  async deleteComment(req: Request, res: Response) {
    try {
      const commentId = req.params.id;
      const comment = await commentsModel.findByIdAndDelete(commentId);

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Decrement post numOfComments
      await postModel.updateOne(
        { _id: comment.postId },
        { $inc: { numOfComments: -1 } }
      );

      res.status(200).json({ message: "Comment deleted", comment });
    } catch (error) {
      res.status(500).json({ message: "Error deleting comment", error });
    }
  }
}

export default new CommentsController();
