// commentsController.js
import commentsModel, { iComment } from "../models/comments_model";
import { Request, Response } from "express";
import BaseController from "./base_controller";

class CommentsController extends BaseController<iComment> {
  constructor() {
    super(commentsModel);
  }
  async create(req: Request, res: Response) {
    const userId = req.params.userId;
    const comment = { ...req.body, sender: userId, postId: req.body.postId };
    req.body = comment;

    super.create(req, res);
  }

  async getCommentsByPostId(req: Request, res: Response) {
    try {
      const comments = await commentsModel.find({ postId: req.params.postId });
      res.json(comments);
    } catch (error) {
      console.log(error);

      res.status(500).json({ message: error });
    }
  }
}
export default new CommentsController();

// const commentsController = new BaseController<iComment>(commentsModel); //in this line we create an object of the class BaseController which all the functions will be in the object commentsController
// const getCommentsByPostId = async (req: Request, res: Response) => {
//   try {
//     const comments = await commentsModel.find({ postId: req.params.postId });
//     res.json(comments);
//   } catch (error) {
//     console.log(error);

//     res.status(500).json({ message: error });
//   }
// };
// export default commentsController;

//---------------------Newer Version---------------------
// import commentsModel, { iComment } from "../models/comments_model";
// import { Request, Response } from "express";
// import createController from "./base_controller";

// const commentsController = createController<iComment>(commentsModel); //in this line we create an object of the class BaseController which all the functions will be in the object commentsController

// const getCommentsByPostId = async (req: Request, res: Response) => {
//   try {
//     const comments = await commentsModel.find({ postId: req.params.postId });
//     res.json(comments);
//   } catch (error) {
//     console.log(error);

//     res.status(500).json({ message: error });
//   }
// };
// export default commentsController;
//---------------------Older Version---------------------
// const createComment = async (req: Request, res: Response) => {
//   baseController.create(req, res, commentsModel);
// };

// const updateComment = async (req: Request, res: Response) => {
//   baseController.update(req, res, commentsModel);
// };

// const getCommentById = async (req: Request, res: Response) => {
//   baseController.getById(req, res, commentsModel);
// };

// const deleteComment = async (req: Request, res: Response) => {
//   baseController.deleteById(req, res, commentsModel);
// };
// const getCommentsByPostId = async (req: Request, res: Response) => {
//   try {
//     const comments = await commentsModel.find({ postId: req.params.postId });
//     res.json(comments);
//   } catch (error) {
//     console.log(error);

//     res.status(500).json({ message: error });
//   }
// };

// const getAllComments = async (req: Request, res: Response) => {
//   try {
//     const comments = await commentsModel.find();
//     res.json(comments);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: error });
//   }
// };
// export default {
//   getCommentsByPostId,
//   deleteComment,
//   updateComment,
//   createComment,
//   getCommentById,
//   getAllComments,
// };
