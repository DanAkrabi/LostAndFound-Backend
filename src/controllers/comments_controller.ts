import commentsModel, { iComment } from "../models/comments_model";
import BaseController from "./base_controller";
import { Request, Response } from "express";
import postModel from "../models/posts_model";
import userModel from "../models/users_model";

class CommentsController extends BaseController<iComment> {
  constructor() {
    super(commentsModel);
  }

  async getCommentsByPost(req: Request, res: Response) {
    try {
      const postId = req.params.postId;
      console.log("📥 בקשת שליפת תגובות לפוסט:", postId);

      // קריאה מה-query string
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const skip = (page - 1) * limit;

      console.log(`📄 עמוד: ${page}, גבול: ${limit}, דילוג: ${skip}`);

      // סך כל התגובות לפוסט הזה
      const totalComments = await commentsModel.countDocuments({ postId });
      const totalPages = Math.ceil(totalComments / limit);
      console.log("🔢 סך תגובות שנמצאו:", totalComments);
      console.log("📊 סך עמודים:", totalPages);

      // שליפת תגובות עם skip ו-limit
      const comments = await commentsModel
        .find({ postId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      console.log("📦 תגובות שנשלפו:", comments.length);

      // העשרה עם פרטי משתמש
      const enrichedComments = await Promise.all(
        comments.map(async (comment) => {
          console.log("💬 תגובה שנשלפה:", comment.content);
          console.log("🆔 מזהה שולח:", comment.sender);

          try {
            const user = await userModel.findById(comment.sender);
            console.log("👤 שם משתמש:", user?.username);
            console.log("🖼️ תמונת פרופיל:", user?.profileImage);

            return {
              _id: comment._id,
              postId: comment.postId,
              content: comment.content,
              sender: comment.sender,
              senderUsername: user?.username || "משתמש לא ידוע",
              senderProfileImage: user?.profileImage || "/default-avatar.png",
            };
          } catch (err) {
            console.error("❌ שגיאה בהבאת מידע על המשתמש:", err);
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

      // תגובה סופית עם עמודים
      res.status(200).json({
        comments: enrichedComments,
        currentPage: page,
        totalPages,
      });
    } catch (error) {
      console.error("❌ שגיאה כללית בשליפת תגובות:", error);
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
