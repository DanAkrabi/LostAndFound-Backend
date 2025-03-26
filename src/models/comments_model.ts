import mongoose from "mongoose";
export interface iComment {
  postId: String;
  sender: String;
  content: String;
}
const CommentSchema = new mongoose.Schema<iComment>(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Posts",
      required: true,
    },
    sender: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const commentModel = mongoose.model<iComment>("Comment", CommentSchema);

export default commentModel;
