import express from "express";
const router = express.Router();
import postController from "../controllers/post_controller"; // importing the functions from post.js
import { authMiddleware } from "../controllers/auth_controller";
// router.post("/toggle-like/:_id", authMiddleware, async (req, res, next) => {
//   try {
//     await postController.toggleLike(req, res);
//   } catch (err) {
//     next(err);
//   }
// });
/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Retrieve all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: A list of all posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */

router.get("/all", postController.getAll.bind(postController)); // Updated route to avoid conflict

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Retrieve a specific post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to retrieve
 *     responses:
 *       200:
 *         description: A single post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */

router.get("/:id", (req, res) => {
  postController.getById(req, res);
});

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       404:
 *         description: Post not found
 */

// router.put("/:id", postController.updatePost.bind(postController));
router.put("/:id", authMiddleware, (req, res, next) => {
  postController.updatePost(req, res).catch(next); // במקרה של שגיאה, next יעבור אל handler אחר
});

// router.put("/:id", (req, res) => {
//   postController.update(req, res);
// });

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
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 *       401:
 *         description: Unauthorized
 */

router.post("/create", authMiddleware, async (req, res, next) => {
  try {
    await postController.createPost(req, res);
  } catch (error) {
    next(error);
  }
});
// router.post(
//   "/create",
//   authMiddleware,
//   postController.createPost.bind(postController)
// );

// router.post("/", authMiddleware, postController.create.bind(postController));

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 */

// router.delete(
//   "/:id",
//   authMiddleware,
//   postController.deletePost.bind(postController)
// );
router.delete("/:id", authMiddleware, (req, res, next) => {
  postController.deletePost(req, res).catch(next); // במקרה של שגיאה, next יעבור אל handler אחר
});
router.get("/", postController.getPaginatedPosts.bind(postController)); // Default route for paginated posts
// router.put("/like/:_id", authMiddleware, (req, res, next) => {
//   postController.like(req, res).catch(next);
// });
router.put("/like/:_id", authMiddleware, async (req, res, next) => {
  try {
    await postController.Like(req, res); // Assuming toggleLike handles likes
  } catch (error) {
    next(error);
  }
});

router.put("/unlike/:_id", authMiddleware, (req, res, next) => {
  postController.unLike(req, res).catch(next);
});

export default router;
