"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const posts_model_1 = __importDefault(require("../models/posts_model"));
const base_controller_1 = __importDefault(require("./base_controller"));
const mongoose_1 = __importDefault(require("mongoose"));
const api_controller_1 = require("../controllers/api_controller");
const users_model_1 = __importDefault(require("../models/users_model"));
const auth_controller_1 = require("../controllers/auth_controller");
class PostController extends base_controller_1.default {
    constructor(model) {
        //super(postsModel);
        super(model);
    }
    createPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Create Post - Received Request");
            console.log("Full Request Body:", req.body);
            console.log("userId from req.params.userId:", req.params.userId);
            try {
                // Destructure request body with defaults
                const { title = "", content = "", sender = "", location = null, imagePath = "", } = req.body;
                // Validate required fields
                const missingFields = [];
                if (!sender)
                    missingFields.push("sender");
                if (!content)
                    missingFields.push("content");
                if (!location)
                    missingFields.push("location");
                if (missingFields.length > 0) {
                    res.status(400).json({
                        error: "Missing required fields",
                        missingFields,
                    });
                    return;
                }
                // Image URL handling
                let imageUrl = imagePath;
                console.log("Image URL:", imageUrl);
                if (!imageUrl) {
                    try {
                        // Generate image if no URL provided
                        imageUrl = yield (0, api_controller_1.generateImage)(title || "Default Post");
                    }
                    catch (imageError) {
                        console.error("Image generation error:", imageError);
                        imageUrl = ""; // Fallback to empty string
                    }
                }
                // Prepare post data
                const post = {
                    title: title || "Untitled Post",
                    content: content,
                    sender,
                    location,
                    imageUrl,
                };
                // Log the final post data before creation
                console.log("Creating Post:", post);
                // Save the new post to the database
                const newPost = yield posts_model_1.default.create(post);
                console.log("Post Created Successfully:", newPost);
                res.status(201).json(newPost);
                return;
            }
            catch (error) {
                console.error("Detailed Error in Post Creation:", {
                    error,
                    errorName: error instanceof Error ? error.name : "Unknown Error",
                    errorMessage: error instanceof Error ? error.message : "No error message",
                    stack: error instanceof Error ? error.stack : "No stack trace",
                });
                res.status(500).json({
                    error: "Internal Server Error",
                    details: error instanceof Error ? error.message : "Unknown error",
                });
                return;
            }
        });
    }
    deletePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const postID = req.params._id;
            try {
                const postToDelete = yield posts_model_1.default.findByIdAndDelete(postID);
                if (!postToDelete) {
                    res.status(404).send("Couldnt find post");
                    return;
                }
                else {
                    res.status(200).send(postToDelete);
                    return;
                }
            }
            catch (error) {
                res.status(400).send(error);
                return;
            }
        });
    }
    unLike(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
            if (!mongoose_1.default.Types.ObjectId.isValid(postID)) {
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
                userId = (0, auth_controller_1.decodeToken)(token);
                console.log("Decoded User ID:", userId);
                if (!userId) {
                    res.status(403).send("Invalid Token");
                    return;
                }
            }
            catch (err) {
                console.error("Token decoding failed:", err);
                res.status(403).send("Invalid Token");
                return;
            }
            // Validate user ID format
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                console.log("Invalid user ID");
                res.status(400).send("Invalid user ID");
                return;
            }
            try {
                // First check if the post exists
                const post = yield posts_model_1.default.findById(postID);
                if (!post) {
                    console.log("Post not found");
                    res.status(404).send("Couldn't find post");
                    return;
                }
                // Check if user has liked this post
                const user = yield users_model_1.default.findById(userId);
                if (!user) {
                    console.log("User not found");
                    res.status(404).send("Couldn't find user");
                    return;
                }
                // Check if likedPosts array exists and if user has liked this post
                if (!user.likedPosts ||
                    !user.likedPosts.some((id) => id.toString() === postID)) {
                    console.log("User has not liked this post");
                    res.status(400).send("User has not liked this post");
                    return;
                }
                // Decrement the post likes count (ensure it doesn't go below 0)
                post.likes = Math.max(0, (post.likes || 1) - 1);
                yield post.save();
                // Remove post from user's likedPosts
                user.likedPosts = user.likedPosts.filter((id) => id.toString() !== postID);
                yield user.save();
                console.log("Post and user updated successfully for unlike");
                // Return the updated post
                res.status(200).json(post);
            }
            catch (err) {
                console.error("Database error:", err);
                // Log additional error details
                if (err instanceof Error) {
                    console.error("Error message:", err.message);
                    console.error("Error stack:", err.stack);
                }
                res.status(500).send("Database error while updating post");
            }
        });
    }
    addLike(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
            if (!mongoose_1.default.Types.ObjectId.isValid(postID)) {
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
                userId = (0, auth_controller_1.decodeToken)(token);
                console.log("Decoded User ID:", userId);
                if (!userId) {
                    res.status(403).send("Invalid Token");
                    return;
                }
            }
            catch (err) {
                console.error("Token decoding failed:", err);
                res.status(403).send("Invalid Token");
                return;
            }
            // Validate user ID format
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                console.log("Invalid user ID");
                res.status(400).send("Invalid user ID");
                return;
            }
            try {
                // First check if the post exists
                const objectId = new mongoose_1.default.Types.ObjectId(postID);
                const post = yield posts_model_1.default.findById(objectId);
                if (!post) {
                    console.log("Post not found");
                    res.status(404).send("Couldn't find post");
                    return;
                }
                // Check if user already liked this post
                const user = yield users_model_1.default.findById(userId);
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
                yield post.save();
                // Add post to user's likedPosts
                user.likedPosts.push(postID);
                yield user.save();
                console.log("Post and user updated successfully");
                // Return the updated post
                res.status(200).json(post);
            }
            catch (err) {
                console.error("Database error:", err);
                // Log additional error details
                if (err instanceof Error) {
                    console.error("Error message:", err.message);
                    console.error("Error stack:", err.stack);
                }
                res.status(500).send("Database error while updating post");
            }
        });
    }
    updatePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const askerID = req.params._id;
            const newContent = req.body.content;
            try {
                const postToUpdate = yield posts_model_1.default.findByIdAndUpdate(askerID, { content: newContent }, { new: true });
                if (!postToUpdate) {
                    res.status(404).send("COULDNT FIND POST! DUE TO AN ERROR");
                    return;
                }
                else {
                    res.status(200).send(postToUpdate);
                    return;
                }
            }
            catch (error) {
                res.status(400).send(error);
                return;
            }
        });
    }
    isLiked(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const postID = req.params._id;
            const authHeader = req.headers["authorization"];
            const token = authHeader && authHeader.split(" ")[1];
            if (!token) {
                res.status(401).send("Missing token");
                return;
            }
            try {
                const userId = (0, auth_controller_1.decodeToken)(token);
                if (!userId) {
                    res.status(403).send("Invalid Token");
                    return;
                }
                const userProfile = yield users_model_1.default.findById(userId);
                if (!userProfile) {
                    res.status(404).send("User not found");
                    return;
                }
                if (((_a = userProfile.likedPosts) !== null && _a !== void 0 ? _a : []).includes(postID)) {
                    res.status(200).send(true);
                }
                else {
                    res.status(200).send(false);
                }
            }
            catch (error) {
                res.status(400).send(error);
                return;
            }
        });
    }
}
exports.default = new PostController(posts_model_1.default);
// import { Request, Response } from "express";
// import mongoose from "mongoose";
// import postModel, { iPost } from "../models/posts_model";
// import userModel from "../models/users_model";
// import BaseController from "./base_controller";
// import { decodeToken } from "./auth_controller";
// class PostsController extends BaseController<iPost> {
//   constructor() {
//     super(postModel);
//   }
//   async create(req: Request, res: Response) {
//     try {
//       const userId = req.params.userId;
//       const postData = { ...req.body, sender: userId };
//       req.body = postData;
//       super.create(req, res);
//     } catch (error) {
//       console.error("Failed to create post:", error);
//       res.status(500).json({ message: "Server error while creating post" });
//     }
//   }
//   async delete(req: Request, res: Response) {
//     const postId = req.params.id;
//     try {
//       const deleted = await postModel.findByIdAndDelete(postId);
//       if (!deleted) {
//         return res.status(404).json({ message: "Post not found" });
//       }
//       res.status(200).json({ message: "Post deleted", post: deleted });
//     } catch (error) {
//       res.status(500).json({ message: "Failed to delete post", error });
//     }
//   }
//   async like(req: Request, res: Response) {
//     const postId = req.params.id;
//     const token = req.headers["authorization"]?.split(" ")[1];
//     if (!token) return res.status(401).send("Missing token");
//     try {
//       const userId = decodeToken(token);
//       if (!userId) return res.status(403).send("Invalid token");
//       const post = await postModel.findById(postId);
//       const user = await userModel.findById(userId);
//       if (!post || !user) return res.status(404).send("Post or user not found");
//       if (user.likedPosts?.includes(postId)) {
//         return res.status(400).send("User already liked this post");
//       }
//       post.likes = (post.likes ?? 0) + 1;
//       await post.save();
//       user.likedPosts?.push(postId);
//       await user.save();
//       res.status(200).json(post);
//     } catch (error) {
//       res.status(500).json({ message: "Failed to like post", error });
//     }
//   }
//   async unlike(req: Request, res: Response) {
//     const postId = req.params.id;
//     const token = req.headers["authorization"]?.split(" ")[1];
//     if (!token) return res.status(401).send("Missing token");
//     try {
//       const userId = decodeToken(token);
//       if (!userId) return res.status(403).send("Invalid token");
//       const post = await postModel.findById(postId);
//       const user = await userModel.findById(userId);
//       if (!post || !user) return res.status(404).send("Post or user not found");
//       if (!user.likedPosts?.includes(postId)) {
//         return res.status(400).send("User has not liked this post");
//       }
//       post.likes = Math.max(0, (post.likes ?? 1) - 1);
//       await post.save();
//       user.likedPosts = user.likedPosts.filter(
//         (id) => id.toString() !== postId
//       );
//       await user.save();
//       res.status(200).json(post);
//     } catch (error) {
//       res.status(500).json({ message: "Failed to unlike post", error });
//     }
//   }
//   async update(req: Request, res: Response) {
//     const postId = req.params.id;
//     const { content, title } = req.body;
//     try {
//       const updated = await postModel.findByIdAndUpdate(
//         postId,
//         { ...(content && { content }), ...(title && { title }) },
//         { new: true }
//       );
//       if (!updated) return res.status(404).send("Post not found");
//       res.status(200).json(updated);
//     } catch (error) {
//       res.status(500).send("Error updating post");
//     }
//   }
//   async isLiked(req: Request, res: Response) {
//     const postId = req.params.id;
//     const token = req.headers["authorization"]?.split(" ")[1];
//     if (!token) return res.status(401).send("Missing token");
//     try {
//       const userId = decodeToken(token);
//       if (!userId) return res.status(403).send("Invalid token");
//       const user = await userModel.findById(userId);
//       if (!user) return res.status(404).send("User not found");
//       const liked = user.likedPosts?.includes(postId) ?? false;
//       res.status(200).json({ liked });
//     } catch (error) {
//       res.status(500).send("Error checking like status");
//     }
//   }
// }
// export default new PostsController();
//# sourceMappingURL=post_controller.js.map