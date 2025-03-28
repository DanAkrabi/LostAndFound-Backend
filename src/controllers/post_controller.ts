import { Request, Response } from "express";
import mongoose from "mongoose";
import postModel, { iPost } from "../models/posts_model";
import userModel from "../models/users_model";
import BaseController from "./base_controller";
import { decodeToken } from "./auth_controller";

class PostsController extends BaseController<iPost> {
  constructor() {
    super(postModel);
  }

  async create(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const postData = { ...req.body, sender: userId };

      req.body = postData;
      super.create(req, res);
    } catch (error) {
      console.error("Failed to create post:", error);
      res.status(500).json({ message: "Server error while creating post" });
    }
  }

  async delete(req: Request, res: Response) {
    const postId = req.params.id;

    try {
      const deleted = await postModel.findByIdAndDelete(postId);
      if (!deleted) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.status(200).json({ message: "Post deleted", post: deleted });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post", error });
    }
  }

  async like(req: Request, res: Response) {
    const postId = req.params.id;
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) return res.status(401).send("Missing token");

    try {
      const userId = decodeToken(token);
      if (!userId) return res.status(403).send("Invalid token");

      const post = await postModel.findById(postId);
      const user = await userModel.findById(userId);

      if (!post || !user) return res.status(404).send("Post or user not found");

      if (user.likedPosts?.includes(postId)) {
        return res.status(400).send("User already liked this post");
      }

      post.likes = (post.likes ?? 0) + 1;
      await post.save();

      user.likedPosts?.push(postId);
      await user.save();

      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to like post", error });
    }
  }

  async unlike(req: Request, res: Response) {
    const postId = req.params.id;
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) return res.status(401).send("Missing token");

    try {
      const userId = decodeToken(token);
      if (!userId) return res.status(403).send("Invalid token");

      const post = await postModel.findById(postId);
      const user = await userModel.findById(userId);

      if (!post || !user) return res.status(404).send("Post or user not found");

      if (!user.likedPosts?.includes(postId)) {
        return res.status(400).send("User has not liked this post");
      }

      post.likes = Math.max(0, (post.likes ?? 1) - 1);
      await post.save();

      user.likedPosts = user.likedPosts.filter(
        (id) => id.toString() !== postId
      );
      await user.save();

      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to unlike post", error });
    }
  }

  async update(req: Request, res: Response) {
    const postId = req.params.id;
    const { content, title } = req.body;

    try {
      const updated = await postModel.findByIdAndUpdate(
        postId,
        { ...(content && { content }), ...(title && { title }) },
        { new: true }
      );

      if (!updated) return res.status(404).send("Post not found");

      res.status(200).json(updated);
    } catch (error) {
      res.status(500).send("Error updating post");
    }
  }

  async isLiked(req: Request, res: Response) {
    const postId = req.params.id;
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) return res.status(401).send("Missing token");

    try {
      const userId = decodeToken(token);
      if (!userId) return res.status(403).send("Invalid token");

      const user = await userModel.findById(userId);
      if (!user) return res.status(404).send("User not found");

      const liked = user.likedPosts?.includes(postId) ?? false;
      res.status(200).json({ liked });
    } catch (error) {
      res.status(500).send("Error checking like status");
    }
  }
}

export default new PostsController();
