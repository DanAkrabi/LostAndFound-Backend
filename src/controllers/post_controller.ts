import postsModel, { iPost } from "../models/posts_model";
import { Request, Response } from "express";
import BaseController from "./base_controller";
import mongoose from "mongoose";
import { generateImage } from "../controllers/api_controller";
import userModel from "../models/users_model";
import { decodeToken } from "../controllers/auth_controller";
import commentModel from "../models/comments_model";
class PostController extends BaseController<iPost> {
  constructor(model: mongoose.Model<iPost>) {
    //super(postsModel);
    super(model);
  }
  // getPaginatedPosts = async (req: Request, res: Response) => {
  //   try {
  //     console.log("🟢 Reached getPaginatedPosts route");

  //     const page = parseInt((req.query.page as string) || "1");
  //     const limit = parseInt((req.query.limit as string) || "6");
  //     const sender = req.query.sender as string;

  //     console.log("📩 Query params:", { page, limit, sender });

  //     const query: any = sender ? { sender } : {};
  //     const totalPosts = await this.model.countDocuments(query);
  //     const totalPages = Math.ceil(totalPosts / limit);

  //     const posts = await this.model
  //       .find(query)
  //       .sort({ createdAt: -1 })
  //       .skip((page - 1) * limit)
  //       .limit(limit);

  //     // 🧠 זיהוי המשתמש
  //     const authHeader = req.headers["authorization"];
  //     const token = authHeader?.split(" ")[1];
  //     let userId = null;
  //     let likedPostIdsSet = new Set<string>();

  //     if (token) {
  //       try {
  //         userId = decodeToken(token);
  //         const user = await userModel.findById(userId);
  //         likedPostIdsSet = new Set(
  //           (user?.likedPosts ?? []).map((id) => id.toString())
  //         );
  //       } catch (err) {
  //         console.warn("⚠️ Failed to decode token or find user:", err);
  //       }
  //     }

  //     // ✨ enrich posts with sender info + hasLiked + numOfComments
  //     const enrichedPosts = await Promise.all(
  //       posts.map(async (post) => {
  //         try {
  //           const user = await userModel.findById(post.sender);
  //           const commentCount = await commentModel.countDocuments({
  //             postId: post._id,
  //           });

  //           const hasLiked = likedPostIdsSet.has(post._id.toString());
  //           console.log(`🔍 Post ID: ${post._id} | hasLiked: ${hasLiked}`);

  //           return {
  //             _id: post._id,
  //             title: post.title,
  //             content: post.content,
  //             likes: post.likes,
  //             numOfComments: commentCount,
  //             imagePath: post.imagePath,
  //             location: post.location,
  //             createdAt: post.createdAt,
  //             sender: post.sender,
  //             senderUsername: user?.username || "משתמש לא ידוע",
  //             senderProfileImage: user?.profileImage || "/default-avatar.png",
  //             hasLiked,
  //           };
  //         } catch (err) {
  //           const fallbackCommentCount = await commentModel.countDocuments({
  //             postId: post._id,
  //           });
  //           const hasLiked = likedPostIdsSet.has(post._id.toString());
  //           console.log(
  //             `🔍 [Fallback] Post ID: ${post._id} | hasLiked: ${hasLiked}`
  //           );

  //           return {
  //             _id: post._id,
  //             title: post.title,
  //             content: post.content,
  //             likes: post.likes,
  //             numOfComments: fallbackCommentCount,
  //             imagePath: post.imagePath,
  //             location: post.location,
  //             createdAt: post.createdAt,
  //             sender: post.sender,
  //             senderUsername: "שגיאה",
  //             senderProfileImage: "/default-avatar.png",
  //             hasLiked,
  //           };
  //         }
  //       })
  //     );

  //     res.json({ posts: enrichedPosts, currentPage: page, totalPages });
  //   } catch (error) {
  //     console.error("❌ Error in getPaginatedPosts:", error);
  //     res.status(500).json({ message: "Server error", error });
  //   }
  // };

  getPaginatedPosts = async (req: Request, res: Response) => {
    try {
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

      // 🧠 זיהוי המשתמש
      const authHeader = req.headers["authorization"];
      const token = authHeader?.split(" ")[1];
      let userId: string | null = null;

      if (token) {
        try {
          userId = decodeToken(token);
        } catch (err) {
          console.warn("⚠️ Failed to decode token:", err);
        }
      }

      // ✨ enrich posts
      const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
          try {
            const senderUser = await userModel.findById(post.sender);
            const commentCount = await commentModel.countDocuments({
              postId: post._id,
            });

            const hasLiked = userId
              ? post.likedBy?.some((id) => id.toString() === userId)
              : false;

            console.log(`🔍 Post ID: ${post._id} | hasLiked: ${hasLiked}`);

            return {
              _id: post._id,
              title: post.title,
              content: post.content,
              likes: post.likes,
              numOfComments: commentCount,
              imagePath: post.imagePath,
              location: post.location,
              createdAt: post.createdAt,
              sender: post.sender,
              senderUsername: senderUser?.username || "משתמש לא ידוע",
              senderProfileImage:
                senderUser?.profileImage || "/default-avatar.png",
              hasLiked,
            };
          } catch (err) {
            const fallbackCommentCount = await commentModel.countDocuments({
              postId: post._id,
            });
            const hasLiked = userId
              ? post.likedBy?.some((id) => id.toString() === userId)
              : false;

            console.log(
              `🔍 [Fallback] Post ID: ${post._id} | hasLiked: ${hasLiked}`
            );

            return {
              _id: post._id,
              title: post.title,
              content: post.content,
              likes: post.likes,
              numOfComments: fallbackCommentCount,
              imagePath: post.imagePath,
              location: post.location,
              createdAt: post.createdAt,
              sender: post.sender,
              senderUsername: "שגיאה",
              senderProfileImage: "/default-avatar.png",
              hasLiked,
            };
          }
        })
      );

      res.json({ posts: enrichedPosts, currentPage: page, totalPages });
    } catch (error) {
      console.error("❌ Error in getPaginatedPosts:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };

  async toggleLike(req: Request, res: Response) {
    const postID = req.params._id;
    const { liked } = req.body;
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
      if (!post) return res.status(404).send("Post not found");

      console.log(
        `🔄 Toggle like request for post ${postID} by user ${userId}`
      );
      console.log(`📌 Current liked status from client: ${liked}`);

      const alreadyLiked = post.likedBy?.some((id) => id.toString() === userId);

      if (liked && alreadyLiked) {
        // 🔽 הורדת לייק
        post.likes = Math.max(0, post.likes - 1);
        post.likedBy = (post.likedBy ?? []).filter(
          (id) => id.toString() !== userId
        );
        console.log("🧨 User has already liked the post, unliking now...");
      } else if (!liked && !alreadyLiked) {
        // 🔼 הוספת לייק
        post.likes += 1;
        post.likedBy = post.likedBy || [];
        post.likedBy.push(new mongoose.Types.ObjectId(userId));
        console.log("💖 User has not liked the post yet, liking now...");
      } else {
        console.warn("⚠️ Inconsistent like state - no action taken.");
      }

      await post.save();

      const newLikedStatus = !liked;
      console.log(`📤 Returning new liked status: ${newLikedStatus}`);

      res.status(200).json({
        postId: post._id,
        likes: post.likes,
        liked: newLikedStatus,
      });
    } catch (err) {
      console.error("❌ Error in toggleLike:", err);
      res.status(500).send("Server error");
    }
  }

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
        userId,
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

  // async deletePost(req: Request, res: Response) {
  //   const postID = req.params._id;
  //   try {
  //     const postToDelete = await postsModel.findByIdAndDelete(postID);
  //     if (!postToDelete) {
  //       res.status(404).send("Couldnt find post");
  //       return;
  //     } else {
  //       res.status(200).send(postToDelete);
  //       return;
  //     }
  //   } catch (error) {
  //     res.status(400).send(error);
  //     return;
  //   }
  // }
  // async like(req: Request, res: Response) {
  //   const postID = req.params._id;
  //   const authHeader = req.headers["authorization"];
  //   const token = authHeader?.split(" ")[1];

  //   if (!token) return res.status(401).send("Missing token");

  //   try {
  //     const userId = decodeToken(token);
  //     if (!userId) return res.status(403).send("Invalid token");

  //     if (!mongoose.Types.ObjectId.isValid(postID)) {
  //       return res.status(400).send("Invalid post ID");
  //     }

  //     const post = await postsModel.findById(postID);
  //     const user = await userModel.findById(userId);

  //     if (!post || !user) {
  //       return res.status(404).send("Post or user not found");
  //     }

  //     const alreadyLiked = user.likedPosts?.some(
  //       (id) => id.toString() === postID
  //     );

  //     if (alreadyLiked) {
  //       return res.status(400).send("Post already liked");
  //     }

  //     post.likes += 1;
  //     user.likedPosts = [...(user.likedPosts || []), postID];

  //     await post.save();
  //     await user.save();

  //     return res.status(200).json({ liked: true, likes: post.likes });
  //   } catch (err) {
  //     console.error("Error in like:", err);
  //     return res.status(500).send("Server error");
  //   }
  // }

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

  // async updatePost(req: Request, res: Response) {
  //   const askerID = req.params._id;
  //   const newContent = req.body.content;
  //   try {
  //     const postToUpdate = await postsModel.findByIdAndUpdate(
  //       askerID,
  //       { content: newContent },
  //       { new: true }
  //     );
  //     if (!postToUpdate) {
  //       res.status(404).send("COULDNT FIND POST! DUE TO AN ERROR");
  //       return;
  //     } else {
  //       res.status(200).send(postToUpdate);
  //       return;
  //     }
  //   } catch (error) {
  //     res.status(400).send(error);
  //     return;
  //   }
  // }
  async updatePost(req: Request, res: Response): Promise<void> {
    const postID = req.params.id;
    const { content } = req.body;

    try {
      const updatedPost = await postsModel.findByIdAndUpdate(
        postID,
        { content },
        { new: true }
      );

      if (!updatedPost) {
        res.status(404).send("Post not found");
        return; // Make sure to return after sending response
      }

      res.status(200).send(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).send("Server error");
    }
  }

  // async deletePost(req: Request, res: Response): Promise<void> {
  //   const postID = req.params.id;
  //   const userId = decodeToken(
  //     req.headers["authorization"]?.split(" ")[1] || ""
  //   );

  //   try {
  //     const postToDelete = await postsModel.findById(postID);

  //     if (!postToDelete) {
  //       res.status(404).send("Post not found");
  //       return;
  //     }

  //     if (postToDelete.sender !== userId) {
  //       res.status(403).send("You are not the owner of this post");
  //       return;
  //     }

  //     await postsModel.findByIdAndDelete(postID);

  //     res.status(200).send({ message: "Post deleted" });
  //   } catch (error) {
  //     console.error("Error deleting post:", error);
  //     res.status(400).send("Error deleting post");
  //   }
  // }

  async deletePost(req: Request, res: Response): Promise<void> {
    const postID = req.params.id;
    const userId = decodeToken(
      req.headers["authorization"]?.split(" ")[1] || ""
    );

    try {
      // בדוק אם הפוסט שייך למשתמש

      // הפוסט שייך למשתמש, מחק אותו
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
