import express from "express";
import multer from "multer";
import path from "path";
import { authMiddleware } from "../controllers/auth_controller";
import {
  handleUpload,
  uploadProfileImage,
} from "../controllers/file_controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: File
 *     description: File upload endpoints
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     FileUploadResponse:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           example: "http://localhost:3000/uploads/1712088888888.jpg"
 *     ProfileImageResponse:
 *       type: object
 *       properties:
 *         imageUrl:
 *           type: string
 *           example: "http://localhost:3000/uploads/1712099999999.png"
 */

// הגדרות אחסון לקבצים
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

/**
 * @swagger
 * /file/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [File]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUploadResponse'
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Upload failed
 */
router.post("/upload", authMiddleware, upload.single("file"), handleUpload);

/**
 * @swagger
 * /file/uploadProfileImage:
 *   post:
 *     summary: Upload a profile image
 *     tags: [File]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileImageResponse'
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Failed to upload image
 */
router.post(
  "/uploadProfileImage",
  authMiddleware,
  upload.single("image"),
  uploadProfileImage
);

export default router;
