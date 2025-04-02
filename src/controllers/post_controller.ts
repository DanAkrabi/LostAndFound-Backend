import postsModel, { iPost } from "../models/posts_model";
import { Request, Response } from "express";
import BaseController from "./base_controller";
import mongoose from "mongoose";
import userModel from "../models/users_model";
import { decodeToken } from "../controllers/auth_controller";
import commentModel from "../models/comments_model";
class PostController extends BaseController<iPost> {
  constructor(model: mongoose.Model<iPost>) {
    //super(postsModel);
    super(model);
  }
  async createComment(req: Request, res: Response) {
    try {
      const { content, postId, sender } = req.body;

      console.log("📝 בקשה להוספת תגובה:");
      console.log("✏️ תוכן:", content);
      console.log("📌 פוסט ID:", postId);
      console.log("👤 שולח ID:", sender);

      // יצירת התגובה במסד
      const comment = await commentModel.create({
        content,
        postId,
        sender,
      });

      console.log("✅ תגובה נוספה למסד:", comment._id);

      // עדכון מונה תגובות בפוסט
      const updateResult = await postsModel.updateOne(
        { _id: postId },
        { $inc: { numOfComments: 1 } }
      );

      console.log("🔁 תוצאת עדכון הפוסט:", updateResult);

      res.status(201).json(comment);
    } catch (error) {
      console.error("❌ שגיאה בהוספת תגובה:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }

  getPaginatedPosts = async (req: Request, res: Response) => {
    console.log("🟢 Reached getPaginatedPosts route");

    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const sender = req.query.sender as string | undefined;

      const skip = (page - 1) * limit;
      const query: any = {};

      if (sender) {
        query.sender = sender;
      }

      console.log("📩 Query params:", { page, limit, sender });

      const totalPosts = await postsModel.countDocuments(query);
      const posts = await postsModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
          try {
            // פה נניח שה-sender הוא username
            const user = await userModel.findOne({ username: post.sender });

            if (!user) {
              console.log(`⚠️ User not found for sender: ${post.sender}`);
              return post;
            }

            return {
              ...post.toObject(),
              senderProfileImage: user.profileImage || null,
              senderUsername: user.username,
            };
          } catch (err) {
            console.error("❌ Error enriching post:", err);
            return post;
          }
        })
      );

      console.log(`✅ Returning posts: ${enrichedPosts.length}`);
      res.status(200).json({
        posts: enrichedPosts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
      });
    } catch (err) {
      console.error("❌ Failed to fetch paginated posts:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
  async createPost(req: Request, res: Response) {
    try {
      const {
        title = "Untitled Post",
        content,
        sender,
        location,
        userId,
        imagePath = "",
      } = req.body;

      if (!sender || !content || !location) {
        const missingFields = Object.entries({ sender, content, location })
          .filter(([_, value]) => !value)
          .map(([key]) => key);

        return res.status(400).json({
          error: "Missing required fields",
          missingFields,
        });
      }

      const newPost = await postsModel.create({
        title,
        content,
        sender,
        location,
        userId,
        imagePath,
      });

      res.status(201).json(newPost);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async Like(req: Request, res: Response) {
    const postID = req.params._id;
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Missing token" });

    try {
      const userId = decodeToken(token);
      if (!userId) return res.status(403).json({ message: "Invalid token" });

      if (!mongoose.Types.ObjectId.isValid(postID)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const post = await postsModel.findById(postID);
      const user = await userModel.findById(userId);

      if (!post || !user) {
        return res.status(404).json({ message: "Post or user not found" });
      }

      const hasLiked = user.likedPosts?.some((id) => id.toString() === postID);

      if (hasLiked) {
        return res.status(200).json({
          message: "Post already liked",
          liked: true,
          likes: post.likes,
        }); // מחזיר 200 ולא 400
      }

      post.likes += 1;
      user.likedPosts = user.likedPosts || [];
      user.likedPosts.push(postID);

      await post.save();
      await user.save();

      return res.status(200).json({ liked: true, likes: post.likes });
    } catch (err) {
      console.error("Error in like:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
  async unLike(req: Request, res: Response) {
    const postID = req.params._id;
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) return res.status(401).send("Missing token");

    try {
      const userId = decodeToken(token);
      if (!userId) return res.status(403).send("Invalid token");

      if (!mongoose.Types.ObjectId.isValid(postID)) {
        return res.status(400).send("Invalid post ID");
      }

      const post = await postsModel.findById(postID);
      const user = await userModel.findById(userId);

      if (!post || !user) {
        return res.status(404).send("Post or user not found");
      }

      const hasLiked = user.likedPosts?.some((id) => id.toString() === postID);

      if (!hasLiked) {
        return res.status(400).send("Post not liked yet");
      }

      post.likes = Math.max(0, post.likes - 1);
      user.likedPosts = user.likedPosts?.filter(
        (id) => id.toString() !== postID
      );

      await post.save();
      await user.save();

      return res.status(200).json({ liked: false, likes: post.likes });
    } catch (err) {
      console.error("Error in unlike:", err);
      return res.status(500).send("Server error");
    }
  }

  async updatePost(req: Request, res: Response): Promise<void> {
    const { title, content, imagePath } = req.body;
    try {
      const updatedPost = await postsModel.findByIdAndUpdate(
        req.params.id,
        { title, content, imagePath }, // עדכון כל השדות כולל התמונה
        { new: true }
      );

      if (!updatedPost) {
        res.status(404).send("Post not found");
      }

      res.status(200).send(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).send("Server error");
    }
  }

  async deletePost(req: Request, res: Response): Promise<void> {
    const postID = req.params.id;
    const userId = decodeToken(
      req.headers["authorization"]?.split(" ")[1] || ""
    );

    try {
      await postsModel.findByIdAndDelete(postID);

      res.status(200).send({ message: "Post deleted" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).send("Internal server error"); // שינוי ל 500 במקרה של שגיאה
    }
  }

  async isLiked(req: Request, res: Response) {
    const postID = req.params._id;
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    try {
      const userId = decodeToken(token);
      if (!userId) {
        return res.status(403).json({ message: "Invalid token" });
      }

      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const hasLiked = user.likedPosts?.some(
        (likedPostId) => likedPostId.toString() === postID
      );

      return res.status(200).json({ liked: !!hasLiked });
    } catch (error) {
      console.error("Error checking isLiked:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}
export default new PostController(postsModel);
