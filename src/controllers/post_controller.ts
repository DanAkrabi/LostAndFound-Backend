import postsModel, { iPost } from "../models/posts_model";
import { Request, Response } from "express";
import BaseController from "./base_controller";
import mongoose from "mongoose";
import { generateImage } from "../controllers/api_controller";
import userModel from "../models/users_model";
import { decodeToken } from "../controllers/auth_controller";

class PostController extends BaseController<iPost> {
  constructor(model: mongoose.Model<iPost>) {
    //super(postsModel);
    super(model);
  }

  getPaginatedPosts = async (req: Request, res: Response) => {
    console.log("🟢 Reached getPaginatedPosts route");

    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "6");
    const sender = req.query.sender as string;

    console.log("📩 Query params:", { page, limit, sender });

    const query: any = sender ? { sender } : {};
    const totalPosts = await this.model.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);

    const posts = await this.model
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    console.log("🔢 Posts returned:", posts.length);
    res.json({ posts, currentPage: page, totalPages });
  };

  async createPost(req: Request, res: Response) {
    console.log("Create Post - Received Request");
    console.log("Full Request Body:", req.body);
    console.log("userId from req.params.userId:", req.params.userId);

    try {
      const {
        title = "Untitled Post",
        content,
        sender,
        location,
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
      let imageUrl = imagePath;
      console.log("Image URL:", imageUrl);

      if (!imageUrl) {
        try {
          imageUrl = await generateImage(title);
        } catch (imageError) {
          console.error("Image generation error:", imageError);
          imageUrl = ""; // Ensure fallback in case of error
        }
      }

      const newPost = await postsModel.create({
        title,
        content,
        sender,
        location,
        imagePath: imageUrl, // Make sure to use the correct field name as per your schema
      });

      console.log("Post Created Successfully:", newPost);
      res.status(201).json(newPost);
    } catch (error) {
      console.error("Detailed Error in Post Creation:", {
        error,
        errorName: error instanceof Error ? error.name : "Unknown Error",
        errorMessage:
          error instanceof Error ? error.message : "No error message",
        stack: error instanceof Error ? error.stack : "No stack trace",
      });
      res.status(500).json({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async deletePost(req: Request, res: Response) {
    const postID = req.params._id;
    try {
      const postToDelete = await postsModel.findByIdAndDelete(postID);
      if (!postToDelete) {
        res.status(404).send("Couldnt find post");
        return;
      } else {
        res.status(200).send(postToDelete);
        return;
      }
    } catch (error) {
      res.status(400).send(error);
      return;
    }
  }
  async unLike(req: Request, res: Response) {
    console.log("unLike function called");

    // Get the post ID from the route parameter
    const postID = req.params._id; // Assuming your route is '/Posts/unlike/:id'
    console.log("Post ID:", postID);

    // Validate that post ID exists
    if (!postID) {
      res.status(400).send("Missing post ID");
      return;
    }

    // Validate post ID format
    if (!mongoose.Types.ObjectId.isValid(postID)) {
      console.log("Invalid post ID format");
      res.status(400).send("Invalid post ID format");
      return;
    }

    // Get and validate token
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      console.log("Missing token");
      res.status(401).send("Missing token");
      return;
    }

    // Decode token to get user ID
    let userId;
    try {
      userId = decodeToken(token);
      console.log("Decoded User ID:", userId);
      if (!userId) {
        res.status(403).send("Invalid Token");
        return;
      }
    } catch (err) {
      console.error("Token decoding failed:", err);
      res.status(403).send("Invalid Token");
      return;
    }

    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid user ID");
      res.status(400).send("Invalid user ID");
      return;
    }

    try {
      // First check if the post exists
      const post = await postsModel.findById(postID);

      if (!post) {
        console.log("Post not found");
        res.status(404).send("Couldn't find post");
        return;
      }

      // Check if user has liked this post
      const user = await userModel.findById(userId);

      if (!user) {
        console.log("User not found");
        res.status(404).send("Couldn't find user");
        return;
      }

      // Check if likedPosts array exists and if user has liked this post
      if (
        !user.likedPosts ||
        !user.likedPosts.some((id) => id.toString() === postID)
      ) {
        console.log("User has not liked this post");
        res.status(400).send("User has not liked this post");
        return;
      }

      // Decrement the post likes count (ensure it doesn't go below 0)
      post.likes = Math.max(0, (post.likes || 1) - 1);
      await post.save();

      // Remove post from user's likedPosts
      user.likedPosts = user.likedPosts.filter(
        (id) => id.toString() !== postID
      );
      await user.save();

      console.log("Post and user updated successfully for unlike");

      // Return the updated post
      res.status(200).json(post);
    } catch (err) {
      console.error("Database error:", err);
      // Log additional error details
      if (err instanceof Error) {
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
      }
      res.status(500).send("Database error while updating post");
    }
  }

  async addLike(req: Request, res: Response) {
    console.log("addLike function called");

    // Get the post ID from the route parameter
    const postID = req.params._id; // Assuming your route is '/Posts/like/:id'
    console.log("Post ID:", postID);

    // Validate that post ID exists
    if (!postID) {
      res.status(400).send("Missing post ID");
      return;
    }

    // Validate post ID format
    if (!mongoose.Types.ObjectId.isValid(postID)) {
      console.log("Invalid post ID format");
      res.status(400).send("Invalid post ID format");
      return;
    }

    // Get and validate token
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      console.log("Missing token");
      res.status(401).send("Missing token");
      return;
    }

    // Decode token to get user ID
    let userId;
    try {
      userId = decodeToken(token);
      console.log("Decoded User ID:", userId);
      if (!userId) {
        res.status(403).send("Invalid Token");
        return;
      }
    } catch (err) {
      console.error("Token decoding failed:", err);
      res.status(403).send("Invalid Token");
      return;
    }

    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid user ID");
      res.status(400).send("Invalid user ID");
      return;
    }

    try {
      // First check if the post exists
      const objectId = new mongoose.Types.ObjectId(postID);
      const post = await postsModel.findById(objectId);

      if (!post) {
        console.log("Post not found");
        res.status(404).send("Couldn't find post");
        return;
      }

      // Check if user already liked this post
      const user = await userModel.findById(userId);

      if (!user) {
        console.log("User not found");
        res.status(404).send("Couldn't find user");
        return;
      }

      // Initialize likedPosts array if it doesn't exist
      if (!user.likedPosts) {
        user.likedPosts = [];
      }

      // Check if user already liked this post
      if (user.likedPosts.includes(postID)) {
        console.log("User already liked this post");
        res.status(400).send("User already liked this post");
        return;
      }

      // Increment the post likes count
      post.likes = (post.likes || 0) + 1;
      await post.save();

      // Add post to user's likedPosts
      user.likedPosts.push(postID);
      await user.save();

      console.log("Post and user updated successfully");

      // Return the updated post
      res.status(200).json(post);
    } catch (err) {
      console.error("Database error:", err);
      // Log additional error details
      if (err instanceof Error) {
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
      }
      res.status(500).send("Database error while updating post");
    }
  }

  async updatePost(req: Request, res: Response) {
    const askerID = req.params._id;
    const newContent = req.body.content;
    try {
      const postToUpdate = await postsModel.findByIdAndUpdate(
        askerID,
        { content: newContent },
        { new: true }
      );
      if (!postToUpdate) {
        res.status(404).send("COULDNT FIND POST! DUE TO AN ERROR");
        return;
      } else {
        res.status(200).send(postToUpdate);
        return;
      }
    } catch (error) {
      res.status(400).send(error);
      return;
    }
  }

  async isLiked(req: Request, res: Response) {
    const postID = req.params._id;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      res.status(401).send("Missing token");
      return;
    }
    try {
      const userId = decodeToken(token);
      if (!userId) {
        res.status(403).send("Invalid Token");
        return;
      }
      const userProfile = await userModel.findById(userId);
      if (!userProfile) {
        res.status(404).send("User not found");
        return;
      }
      if ((userProfile.likedPosts ?? []).includes(postID)) {
        res.status(200).send(true);
      } else {
        res.status(200).send(false);
      }
    } catch (error) {
      res.status(400).send(error);
      return;
    }
  }
}
export default new PostController(postsModel);
