"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const postSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    content: String,
    sender: { type: String, required: true },
    likes: { type: Number, default: 0 },
    numOfComments: { type: Number, default: 0 },
    imagePath: { type: String, default: "" },
    location: { type: String, default: "" },
}, { timestamps: true } // מוסיף createdAt ו־updatedAt אוטומטית
);
const postModel = mongoose_1.default.model("Posts", postSchema); //were returning an object of type of postModel which uses the interface of "iPost"
exports.default = postModel;
// const postSchema = new Schema({
//   title: { type: String, required: true }, //required=true - means that this paramter must have a value
//   content: String,
//   sender: { type: String, required: true },
// });
//# sourceMappingURL=posts_model.js.map