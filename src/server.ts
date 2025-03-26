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

const app = express();
app.use(cors());
const db = mongoose.connection;
db.on("error", (err) => {
  console.error(err);
});

db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/comments", commentRoutes);
app.use("/posts", postsRoutes); //brings all the routes we declared on ./routes/post_routes, and connects it to our app (makes it work like we wrote it on app.js).
app.use("/auth", authRoutes);
``;
app.get("/about", (req, res) => {
  res.send("about response");
});
const frontPath = path.join(__dirname, "../front"); // מתאים למבנה שלך
app.use(express.static(frontPath));

// כל בקשה שלא תואמת ל-API תחזיר את ה-React index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(frontPath, "index.html"));
});

console.log(`🚀 Server is running on http://localhost:${process.env.PORT}`);

setupSwagger(app);
const initApp = () => {
  return new Promise<Express>((resolve, reject) => {
    //if the promise succeed, it will the app param to app.ts which is an <Express> type that we destructured from express
    //the purpose of this function is to  activate the db server befor the app server

    if (process.env.MONGO_URI === undefined) {
      console.error("MONGO_URI is not set");
      reject();
    } else {
      mongoose.connect(process.env.MONGO_URI).then(() => {
        //only after the db is up, we will start the app server with the when the 'Promise' will be sent to the app.js
        console.log("initApp finished inside server.js");

        resolve(app);
      });
    }
  });
};
// Start server
export default initApp; //exporting the app so we can use it on our tests
