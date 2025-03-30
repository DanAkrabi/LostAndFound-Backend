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
Object.defineProperty(exports, "__esModule", { value: true });
class BaseController {
    constructor(model) {
        this.model = model;
        3;
    }
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sender = req.query.sender;
                const results = sender
                    ? yield this.model.find({ sender })
                    : yield this.model.find();
                res.status(200).json(results);
            }
            catch (error) {
                res.status(400).json({ message: "Failed to fetch items", error });
            }
        });
    }
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const item = yield this.model.findById(req.params.id);
                if (!item) {
                    return res.status(404).json({ message: "Item not found" });
                }
                res.status(200).json(item);
            }
            catch (error) {
                res.status(400).json({ message: "Error retrieving item", error });
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("BaseController.create called with:", req.body);
                const newItem = yield this.model.create(req.body);
                res.status(201).json(newItem);
            }
            catch (error) {
                res.status(400).json({ message: "Error creating item", error });
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updated = yield this.model.findByIdAndUpdate(req.params.id, req.body, { new: true });
                if (!updated) {
                    return res.status(404).json({ message: "Item not found" });
                }
                res.status(200).json(updated);
            }
            catch (error) {
                res.status(400).json({ message: "Error updating item", error });
            }
        });
    }
    deleteById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deleted = yield this.model.findByIdAndDelete(req.params.id);
                if (!deleted) {
                    return res.status(404).json({ message: "Item not found" });
                }
                res.status(200).json({ message: "Item deleted successfully" });
            }
            catch (error) {
                res.status(500).json({ message: "Error deleting item", error });
            }
        });
    }
}
exports.default = BaseController;
//# sourceMappingURL=base_controller.js.map