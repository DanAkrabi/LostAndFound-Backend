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
const comments_model_1 = __importDefault(require("../models/comments_model"));
const base_controller_1 = __importDefault(require("./base_controller"));
const posts_model_1 = __importDefault(require("../models/posts_model"));
class CommentsController extends base_controller_1.default {
    constructor() {
        super(comments_model_1.default);
    }
    create(req, res) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const fullComment = Object.assign(Object.assign({}, req.body), { sender: userId });
                req.body = fullComment;
                yield _super.create.call(this, req, res);
            }
            catch (error) {
                console.error("Error creating comment:", error);
                res.status(500).json({ message: "Failed to create comment", error });
            }
        });
    }
    getCommentsByPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postId = req.params.postId;
                const comments = yield comments_model_1.default.find({ postId });
                if (!comments.length) {
                    return res
                        .status(404)
                        .json({ message: "No comments found for this post" });
                }
                res.status(200).json(comments);
            }
            catch (error) {
                console.error("Error fetching comments:", error);
                res.status(500).json({ message: "Server error", error });
            }
        });
    }
    updateComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const commentId = req.params.id;
                const { content } = req.body;
                const updated = yield comments_model_1.default.findByIdAndUpdate(commentId, { content }, { new: true });
                if (!updated) {
                    return res.status(404).json({ message: "Comment not found" });
                }
                res.status(200).json(updated);
            }
            catch (error) {
                res.status(500).json({ message: "Failed to update comment", error });
            }
        });
    }
    deleteComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const commentId = req.params.id;
                const comment = yield comments_model_1.default.findByIdAndDelete(commentId);
                if (!comment) {
                    return res.status(404).json({ message: "Comment not found" });
                }
                // Decrement post numOfComments
                yield posts_model_1.default.updateOne({ _id: comment.postId }, { $inc: { numOfComments: -1 } });
                res.status(200).json({ message: "Comment deleted", comment });
            }
            catch (error) {
                res.status(500).json({ message: "Error deleting comment", error });
            }
        });
    }
}
exports.default = new CommentsController();
//# sourceMappingURL=comments_controller.js.map