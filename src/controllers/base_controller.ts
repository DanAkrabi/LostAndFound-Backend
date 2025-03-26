//this file's purpose is to make the requests more generic.
import { Request, Response } from "express";
import { Model, Types } from "mongoose";

class BaseController<T> {
    //we're using a class so we wont have to pass the "model" type for each function.
  model: Model<T>;
  constructor(model: Model<T>) {
    this.model = model;
  }

  private async validateRelationships(data: any): Promise<string | null> {
    if (data.postId) {
      const Post = require('../models/posts_model').default;
      const post = await Post.findById(data.postId);
      if (!post) {
        return "Referenced post does not exist";
      }
    }

    if (data.sender) {
      const User = require('../models/users_model').default;
      const user = await User.findById(data.sender);
      if (!user) {
        return "Referenced user does not exist";
      }
    }

    return null;
  }

  async getAll(req: Request, res: Response) {
    const senderFilter = req.query.sender;
    try {
      if (senderFilter) {
        const source = await this.model.find({ sender: senderFilter });
        res.status(200).json(source);
      } else {
        const source = await this.model.find();
        res.status(200).send(source);
      }
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  }

  async getById(req: Request, res: Response) {
    const sourceId = req.params.id;
    try {
      const source = await this.model.findById(sourceId); //this create func is a-sync which means we will reach the res.send line before that the post was even create which is not good, thats why we'll use async await which returns a promeise.
      if (source === null) {
        return res.status(404).send("Post not found");
      } else {
        res.status(200).send(source);
      }
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    const source = req.body;
    try {
      const validationError = await this.validateRelationships(source);
      if (validationError) {
        res.status(400).send({ message: validationError });
        return;
      }

      const newSource = await this.model.create(source);
      res.status(201).send(newSource);
    } catch (error) {
      // if ((error as any).name !== "ValidationError") {
      //   console.log(error); // Log only unexpected errors
      // }
      if (process.env.NODE_ENV !== "test") {
        console.log(error);
      }
      res.status(400).send(error);
    }
}
  async deleteById(req: Request, res: Response) {
    const sourceId = req.params.id;
    try {
      const source = await this.model.findByIdAndDelete(sourceId);
      if (!source) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.status(200).json({ message: `Post with ID ${sourceId} deleted successfully` });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error deleting post", error: error });
    }
  }

  async update(req: Request, res: Response) {
    const sourceId = req.params.id;
    const sourceData = req.body;

    try {
      const validationError = await this.validateRelationships(sourceData);
      if (validationError) {
        return res.status(400).send({ message: validationError });
      }

      const source = await this.model.findByIdAndUpdate(sourceId, sourceData, {
        new: true,
      });
      if (!source) {
        return res.status(404).send({ message: "Post not found" });
      }
      res.status(200).send(source);
    } catch (error) {
      console.log(error);
      res.status(400).send({ message: error });
    }
  }
}

export default BaseController;
// const createController = <T>(model: Model<T>) => {
//   //factory function
//   return new BaseController(model);
// };
// export default createController;


//Backup-------------------------------------------------------------------------------------------------------------------
// const getAll = async (req: Request, res: Response, model: any) => {
//   const senderFilter = req.query.sender;
//   try {
//     if (senderFilter) {
//       const source = await model.find({ sender: senderFilter });
//       res.status(200).json(source);
//     } else {
//       const source = await model.find();
//       res.status(200).send(source);
//     }
//   } catch (error) {
//     console.log(error);

//     res.status(400).send(error);
//   }
// };

// const getById = async (req: Request, res: Response, model: any) => {
//   const sourceId = req.params.id;
//   try {
//     const source = await model.findById(sourceId); //this create func is a-sync which means we will reach the res.send line before that the post was even create which is not good, thats why we'll use async await which returns a promeise.
//     if (source === null) {
//       return res.status(404).send("Post not found");
//     } else {
//       res.status(200).send(source);
//     }
//   } catch (error) {
//     console.log(error);

//     res.status(400).send(error);
//   }
// };

// const create = async (req: Request, res: Response, model: any) => {
//   const source = req.body;
//   try {
//     const newSource = await model.create(source);
//     res.status(201).send(newSource);
//   } catch (error) {
//     // if ((error as any).name !== "ValidationError") {
//     //   console.log(error); // Log only unexpected errors
//     // }
//     if (process.env.NODE_ENV !== "test") {
//       console.log(error);
//     }

//     res.status(400).send(error);
//   }
// };

// const deleteById = async (req: Request, res: Response, model: any) => {
//   const sourceId = req.params.id;
//   try {
//     const source = await model.findByIdAndDelete(sourceId);
//     if (!source) {
//       return res.status(404).json({ message: "Post not found" });
//     }
//     res
//       .status(200)
//       .json({ message: `Post with ID ${sourceId} deleted successfully` });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Error deleting post", error: error });
//   }
// };

// const update = async (req: Request, res: Response, model: any) => {
//   const sourceId = req.params.id;
//   const sourceData = req.body;

//   try {
//     const source = await model.findByIdAndUpdate(sourceId, sourceData, {
//       new: true,
//     });
//     if (!source) {
//       return res.status(404).send({ message: "Post not found" });
//     }
//     res.status(200).send(source);
//   } catch (error) {
//     console.log(error);

//     res.status(400).send({ message: error });
//   }
// };
