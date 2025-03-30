import express from "express";
import multer from "multer";
import path from "path";
import { handleUpload } from "../controllers/file_controller";
import { authMiddleware } from "../controllers/auth_controller";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

router.post("/upload", authMiddleware, upload.single("file"), handleUpload);

export default router;
