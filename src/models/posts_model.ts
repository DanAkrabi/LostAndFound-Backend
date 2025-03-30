import mongoose from "mongoose";
//postSchema - defines the pattern of the collection

// export interface iPost {
//   sender: string;
//   title: string;
//   content: string;
//   likes: number;
//   numOfComments: number;
// }
// const postSchema = new mongoose.Schema<iPost>({
//   title: { type: String, required: true }, //required=true - means that this paramter must have a value
//   content: String,
//   sender: { type: String, required: true },
//   likes: {
//     type: Number,
//     default: 0,
//   },
//   numOfComments: {
//     type: Number,
//     default: 0,
//   },
// });
export interface iPost {
  sender: string;
  title: string;
  content: string;
  likes: number;
  numOfComments: number;
  imagePath?: string;
  location?: string;
  createdAt?: Date;
}
const postSchema = new mongoose.Schema<iPost>(
  {
    title: { type: String, required: true },
    content: String,
    sender: { type: String, required: true },
    likes: { type: Number, default: 0 },
    numOfComments: { type: Number, default: 0 },
    imagePath: { type: String, default: "" },
    location: { type: String, default: "" },
  },
  { timestamps: true } // מוסיף createdAt ו־updatedAt אוטומטית
);

const postModel = mongoose.model<iPost>("Posts", postSchema); //were returning an object of type of postModel which uses the interface of "iPost"

export default postModel;
// const postSchema = new Schema({
//   title: { type: String, required: true }, //required=true - means that this paramter must have a value
//   content: String,
//   sender: { type: String, required: true },
// });
