import postModel, { iPost } from "../models/posts_model";
import { Request, Response } from "express";
import BaseController from "./base_controller";

// const postsController = createController<iPost>(postModel); //in this line we create an object of the class BaseController which all the functions will be in the object postsController

class PostsController extends BaseController<iPost> {
  constructor() {
    super(postModel);
  }

  async create(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const post = { ...req.body, sender: userId };
      req.body = post;
      super.create(req, res);
    } catch (error) {
      res.status(500).json({ message: "Error creating post", error });
    }
  }
}
export default new PostsController();

//---------------------Newer Version---------------------
// const getAllPosts = async (req: Request, res: Response) => {
//   baseController.getAll(req, res, postModel);
// };
// const getPostById = async (req: Request, res: Response) => {
//   baseController.getById(req, res, postModel);
// };
// const createPost = async (req: Request, res: Response) => {
//   baseController.create(req, res, postModel);
// };

// const deletePost = async (req: Request, res: Response) => {
//   baseController.deleteById(req, res, postModel);
// };

// const updatePost = async (req: Request, res: Response) => {
//   baseController.update(req, res, postModel);
// };
// export default {
//   updatePost,
//   getPostById,
//   getAllPosts,
//   createPost,
//   deletePost,
// }; //to use those functions we'll need to use the "require" to receive this object.
//---------------------Older Version---------------------
// const getAllPosts = async (req: Request, res: Response) => {
//   const senderFilter = req.query.sender;
//   try {
//     if (senderFilter) {
//       const posts = await postModel.find({ sender: senderFilter });
//       res.status(200).json(posts);
//     } else {
//       const posts = await postModel.find();
//       res.status(200).send(posts);
//     }
//   } catch (error) {
//     console.log(error);

//     res.status(400).send(error);
//   }
// };

// const createPost = async (req: Request, res: Response) => {
//   const post = req.body; //this is an object and not a string, we can stringfy it
//   try {
//     const newPost = await postModel.create(post); //this create func is a-sync which means we will reach the res.send line before that the post was even create which is not good, thats why we'll use async await which returns a promeise.
//     res.status(201).send(newPost);
//   } catch (error) {
//     console.log(error);
//     res.status(400).send(error);
//   }
// };

// const deletePost = async (req: Request, res: Response) => {
//   const postId = req.params.id;
//   try {
//     const post = await postModel.findByIdAndDelete(postId);
//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }
//     res
//       .status(200)
//       .json({ message: "Post with ID ${postId} deleted successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Error deleting post", error: error });
//   }
// };

// const getPostById = async (req: Request, res: Response) => {
//   const postId = req.params.id;
//   try {
//     const post = await postModel.findById(postId); //this create func is a-sync which means we will reach the res.send line before that the post was even create which is not good, thats why we'll use async await which returns a promeise.
//     if (post === null) {
//       return res.status(404).send("Post not found");
//     } else {
//       res.status(200).send(post);
//     }
//   } catch (error) {
//     console.log(error);

//     res.status(400).send(error);
//   }
// };
// const updatePost = async (req: Request, res: Response) => {
//   const postId = req.params.id;
//   const postData = req.body;

//   try {
//     const post = await postModel.findByIdAndUpdate(postId, postData, {
//       new: true,
//     });
//     if (!post) {
//       return res.status(404).send({ message: "Post not found" });
//     }
//     res.status(200).send(post);
//   } catch (error) {
//     console.log(error);

//     res.status(400).send({ message: error });
//   }
// };
