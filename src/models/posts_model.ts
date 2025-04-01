import mongoose from "mongoose";

export interface iPost {
  sender: string;
  title: string;
  content: string;
  likes: number;
  numOfComments: number;
  imagePath?: string;
  location?: string;
  createdAt?: Date;
  likedBy?: mongoose.Types.ObjectId[];
  // 👈 חדש
}

const postSchema = new mongoose.Schema<iPost>(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    sender: { type: String, required: true },
    likes: { type: Number, default: 0 },
    numOfComments: { type: Number, default: 0 },
    imagePath: { type: String, default: "" },
    location: { type: String, default: "" },

    likedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Users",
      default: [],
    },
  },
  { timestamps: true }
);

const postModel = mongoose.model<iPost>("Posts", postSchema);
export default postModel;
