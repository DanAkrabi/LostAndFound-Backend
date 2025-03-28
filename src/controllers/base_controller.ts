import { Request, Response } from "express";
import { Model } from "mongoose";

class BaseController<T> {
  model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async getAll(req: Request, res: Response) {
    try {
      const sender = req.query.sender;
      const results = sender
        ? await this.model.find({ sender })
        : await this.model.find();
      res.status(200).json(results);
    } catch (error) {
      res.status(400).json({ message: "Failed to fetch items", error });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const item = await this.model.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.status(200).json(item);
    } catch (error) {
      res.status(400).json({ message: "Error retrieving item", error });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const newItem = await this.model.create(req.body);
      res.status(201).json(newItem);
    } catch (error) {
      res.status(400).json({ message: "Error creating item", error });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const updated = await this.model.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: "Error updating item", error });
    }
  }

  async deleteById(req: Request, res: Response) {
    try {
      const deleted = await this.model.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting item", error });
    }
  }
}

export default BaseController;
