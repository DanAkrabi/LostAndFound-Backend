import express from "express";
const router = express.Router();
import postController from "../controllers/post_controller";
import { authMiddleware } from "../controllers/auth_controller";

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Endpoints for managing posts
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - sender
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         sender:
 *           type: string
 *         likes:
 *           type: number
 *         numOfComments:
 *           type: number
 *         imagePath:
 *           type: string
 *         location:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get paginated posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: A paginated list of posts
 */
router.get("/", postController.getPaginatedPosts.bind(postController));

/**
 * @swagger
 * /posts/all:
 *   get:
 *     summary: Get all posts (no pagination)
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: A list of all posts
 */
router.get("/all", postController.getAll.bind(postController));

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: Post found
 *       404:
 *         description: Post not found
 */
router.get("/:id", (req, res) => {
  postController.getById(req, res);
});

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - sender
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               sender:
 *                 type: string
 *               location:
 *                 type: string
 *               imagePath:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created
 *       400:
 *         description: Missing fields
 */
router.post("/create", authMiddleware, async (req, res, next) => {
  try {
    await postController.createPost(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               imagePath:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated
 *       404:
 *         description: Post not found
 */
router.put("/:id", authMiddleware, (req, res, next) => {
  postController.updatePost(req, res).catch(next);
});

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted
 *       404:
 *         description: Post not found
 */
router.delete("/:id", authMiddleware, (req, res, next) => {
  postController.deletePost(req, res).catch(next);
});

/**
 * @swagger
 * /posts/like/{_id}:
 *   put:
 *     summary: Like a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: _id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post liked
 *       401:
 *         description: Unauthorized
 */
router.put("/like/:_id", authMiddleware, async (req, res, next) => {
  try {
    await postController.Like(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /posts/unlike/{_id}:
 *   put:
 *     summary: Unlike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: _id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post unliked
 *       401:
 *         description: Unauthorized
 */
router.put("/unlike/:_id", authMiddleware, (req, res, next) => {
  postController.unLike(req, res).catch(next);
});

/**
 * @swagger
 * /posts/isLiked/{_id}:
 *   get:
 *     summary: Check if user liked a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: _id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like status
 */
router.get("/isLiked/:_id", authMiddleware, (req, res, next) => {
  postController.isLiked(req, res).catch(next);
});

export default router;
