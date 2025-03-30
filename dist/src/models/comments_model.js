"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const CommentSchema = new mongoose_1.default.Schema({
    postId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Posts",
        required: true,
    },
    sender: { type: String, required: true },
    content: { type: String, required: true },
}, { timestamps: true });
const commentModel = mongoose_1.default.model("Comment", CommentSchema);
exports.default = commentModel;
//# sourceMappingURL=comments_model.js.map