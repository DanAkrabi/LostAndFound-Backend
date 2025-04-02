import express from "express";
const router = express.Router();
import commentsController from "../controllers/comments_controller";
import { authMiddleware } from "../controllers/auth_controller";

/**
 * @swagger
 * tags:
 *   - name: Comments
 *     description: API for managing comments on posts
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - postId
 *         - sender
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the comment
 *         postId:
 *           type: string
 *           description: ID of the post this comment belongs to
 *         sender:
 *           type: string
 *           description: The username of the commenter
 *         content:
 *           type: string
 *           description: The content of the comment
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "60d21baee1d1b2c3f4e4e9e8"
 *         postId: "60d21bae1234567890abcdef"
 *         sender: "eden"
 *         content: "This is a great post!"
 *         createdAt: "2025-04-02T12:00:00.000Z"
 *         updatedAt: "2025-04-02T12:00:00.000Z"
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Retrieve all comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
router.get("/", (req, res) => {
  commentsController.getAll(req, res);
});

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - sender
 *               - content
 *             properties:
 *               postId:
 *                 type: string
 *               sender:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authMiddleware,
  commentsController.create.bind(commentsController)
);

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Retrieve a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: A single comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 */
router.get("/:id", (req, res) => {
  commentsController.getById(req, res);
});

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", authMiddleware, (req, res) => {
  commentsController.deleteById.bind(commentsController)(req, res);
});

/**
 * @swagger
 * /comments/{userId}:
 *   post:
 *     summary: Create a comment using userId param
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user creating the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - content
 *             properties:
 *               postId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/:userId",
  authMiddleware,
  commentsController.create.bind(commentsController)
);

/**
 * @swagger
 * /comments/getCommentsByPostID/{postId}:
 *   get:
 *     summary: Retrieve all comments by post ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to retrieve comments for
 *     responses:
 *       200:
 *         description: List of comments for the post
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       404:
 *         description: No comments found for the given post
 */
router.get("/getCommentsByPostID/:postId", (req, res) => {
  commentsController.getCommentsByPost.bind(commentsController)(req, res);
});

export default router;
