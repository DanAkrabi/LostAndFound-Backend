import mongoose, { Schema, Document } from "mongoose";

export interface IUser {
  email: string;
  password?: string;
  username?: string;
  profileImage?: string;
  _id: string;
  refreshTokens: string[];
  likedPosts?: string[];
  googleSignIn?: boolean;
}

// Define the schema
const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function (this: IUser) {
      return !this.googleSignIn; // Password is required only if googleSignIn is false
    },
  },
  username: { type: String, required: false, unique: false },
  profileImage: { type: String, required: false, default: "" },
  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  refreshTokens: { type: [String], default: [] },
  googleSignIn: { type: Boolean, default: false }, // Flag for Google Sign-In
});

// Create the model
const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;
