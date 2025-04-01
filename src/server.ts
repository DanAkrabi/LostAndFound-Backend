import express, { Express } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import postsRoutes from "./routes/posts_routes";
import commentRoutes from "./routes/comments_routes";
import authRoutes from "./routes/auth_routes";
import { setupSwagger } from "../swaggerConfig";
import path from "path";
import cors from "cors";
import fileRoutes from "./routes/file_routes"; // או נתיב מתאים

const app = express();
app.use(cors());
const db = mongoose.connection;
db.on("error", (err) => {
  console.error(err);
});

db.once("open", () => {
  console.log("Connected to MongoDB");
});
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(function (req, res, next) {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/file", fileRoutes);
app.use("/comments", commentRoutes);
app.use("/Posts", postsRoutes); //brings all the routes we declared on ./routes/post_routes, and connects it to our app (makes it work like we wrote it on app.js).
app.use("/auth", authRoutes);
``;
app.get("/about", (req, res) => {
  res.send("about response");
});
const frontPath = path.join(__dirname, "../front"); // מתאים למבנה שלך
app.use(express.static(frontPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontPath, "index.html"));
});

console.log(`🚀 Server is running on http://localhost:${process.env.PORT}`);

setupSwagger(app);
const initApp = () => {
  return new Promise<Express>((resolve, reject) => {
    if (process.env.MONGO_URI === undefined) {
      console.error("MONGO_URI is not set");
      reject();
    } else {
      mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log("initApp finished inside server.js");

        resolve(app);
      });
    }
  });
};
export default initApp; //exporting the app so we can use it on our tests
