"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const post_controller_1 = __importDefault(require("../controllers/post_controller")); // importing the functions from post.js
const auth_controller_1 = require("../controllers/auth_controller");
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
router.get("/", post_controller_1.default.getAll.bind(post_controller_1.default)); //bind attaches the object to the pointers function
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
    post_controller_1.default.getById(req, res);
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
router.put("/:id", post_controller_1.default.updatePost.bind(post_controller_1.default));
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
router.post("/posts/create/:userId", auth_controller_1.authMiddleware, post_controller_1.default.createPost.bind(post_controller_1.default));
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
router.delete("/:id", auth_controller_1.authMiddleware, post_controller_1.default.deletePost.bind(post_controller_1.default));
// router.delete("/:id", authMiddleware, (req, res) => {
//   postController.deleteById(req, res);
// });
router.put("/like/:id", auth_controller_1.authMiddleware, post_controller_1.default.addLike.bind(post_controller_1.default));
router.put("/unlike/:id", auth_controller_1.authMiddleware, post_controller_1.default.unLike.bind(post_controller_1.default));
router.get("/isLiked/:id", auth_controller_1.authMiddleware, post_controller_1.default.isLiked.bind(post_controller_1.default));
exports.default = router;
//# sourceMappingURL=posts_routes.js.map