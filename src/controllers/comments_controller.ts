import commentsModel, { iComment } from "../models/comments_model";
import BaseController from "./base_controller";
import { Request, Response } from "express";
import postModel from "../models/posts_model";
import userModel from "../models/users_model";

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

  // async getCommentsByPost(req: Request, res: Response) {
  //   try {
  //     const postId = req.params.postId;
  //     const comments = await commentsModel.find({ postId });

  //     const enrichedComments = await Promise.all(
  //       comments.map(async (comment) => {
  //         try {
  //           const user = await userModel.findById(comment.sender);

  //           console.log("🧩 Enriching comment:", comment.content);
  //           console.log("👤 Sender ID:", comment.sender);
  //           console.log("📛 Found username:", user?.username);
  //           console.log("🖼️ Profile image:", user?.profileImage);

  //           return {
  //             _id: comment._id,
  //             postId: comment.postId,
  //             content: comment.content,
  //             sender: comment.sender, // נשאר ה-ID
  //             senderUsername: user?.username || "משתמש לא ידוע",
  //             senderProfileImage: user?.profileImage || "/default-avatar.png",
  //           };
  //         } catch (err) {
  //           console.error("❌ Error finding user for comment:", err);
  //           return {
  //             _id: comment._id,
  //             postId: comment.postId,
  //             content: comment.content,
  //             sender: comment.sender,
  //             senderUsername: "שגיאה",
  //             senderProfileImage: "/default-avatar.png",
  //           };
  //         }
  //       })
  //     );

  //     res.status(200).json(enrichedComments);
  //   } catch (error) {
  //     console.error("❌ Error fetching comments:", error);
  //     res.status(500).json({ message: "Server error", error });
  //   }
  // }

  async getCommentsByPost(req: Request, res: Response) {
    try {
      const postId = req.params.postId;

      // קריאה מה-query string
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;

      const skip = (page - 1) * limit;

      // סך כל התגובות לפוסט הזה
      const totalComments = await commentsModel.countDocuments({ postId });
      const totalPages = Math.ceil(totalComments / limit);

      // שליפת תגובות עם skip ו-limit
      const comments = await commentsModel
        .find({ postId })
        .sort({ createdAt: -1 }) // תגובות חדשות קודם
        .skip(skip)
        .limit(limit);

      // העשרה עם פרטי משתמש
      const enrichedComments = await Promise.all(
        comments.map(async (comment) => {
          try {
            const user = await userModel.findById(comment.sender);

            return {
              _id: comment._id,
              postId: comment.postId,
              content: comment.content,
              sender: comment.sender,
              senderUsername: user?.username || "משתמש לא ידוע",
              senderProfileImage: user?.profileImage || "/default-avatar.png",
            };
          } catch (err) {
            return {
              _id: comment._id,
              postId: comment.postId,
              content: comment.content,
              sender: comment.sender,
              senderUsername: "שגיאה",
              senderProfileImage: "/default-avatar.png",
            };
          }
        })
      );

      // ✅ תגובה עם pagination
      res.status(200).json({
        comments: enrichedComments,
        currentPage: page,
        totalPages,
      });
    } catch (error) {
      console.error("❌ Error fetching comments:", error);
      res.status(500).json({ message: "Server error", error });
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
