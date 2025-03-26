import mongoose, { Schema, Document } from "mongoose";

// Define IUser interface correctly
export interface IUser extends Document {
  email: string;
  password: string;
  username?: string;
  imagePath?: string;
  _id: string;
  refreshTokens: string[];
}

// Define the schema
const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: false, unique: false },
  imagePath: { type: String, required: false, default: "" },
  refreshTokens: { type: [String], default: [] },
});

// Create the model
const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;
