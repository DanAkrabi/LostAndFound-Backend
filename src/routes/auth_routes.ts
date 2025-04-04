import express from "express";
import authController, { authMiddleware } from "../controllers/auth_controller";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints for user management
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *         username:
 *           type: string
 *         profileImage:
 *           type: string
 *         refreshTokens:
 *           type: array
 *           items:
 *             type: string
 *         googleSignIn:
 *           type: boolean
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         username:
 *           type: string
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - emailOrUsername
 *         - password
 *       properties:
 *         emailOrUsername:
 *           type: string
 *         password:
 *           type: string
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *         username:
 *           type: string
 *         profileImage:
 *           type: string
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *
 *     GoogleAuthRequest:
 *       type: object
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *
 *     TokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *
 *     TokenResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/google-login:
 *   post:
 *     summary: Authenticate user with Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleAuthRequest'
 *     responses:
 *       200:
 *         description: Google login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid Google token
 */
router.post("/google-login", authController.googleAuth);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TokenRequest'
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Invalid token
 */
router.post("/logout", authController.logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TokenRequest'
 *     responses:
 *       200:
 *         description: Tokens refreshed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Invalid refresh token
 */
router.post("/refresh", authController.refresh);

/**
 * @swagger
 * /auth/users/{userId}:
 *   put:
 *     summary: Update user details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               profileImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 */
router.put("/users/:userId", authMiddleware, authController.updateUser);

export default router;

// // auth_routes.ts
// import express from "express";
// const router = express.Router();
// import authController from "../controllers/auth_controller";
// import { authMiddleware } from "../controllers/auth_controller";

// /**
//  * @swagger
//  * tags:
//  *   name: Auth
//  *   description: User authentication endpoints
//  */

// /**
//  * @swagger
//  * components:
//  *   schemas:
//  *     User:
//  *       type: object
//  *       required:
//  *         - email
//  *         - password
//  *       properties:
//  *         _id:
//  *           type: string
//  *           description: The auto-generated ID of the user
//  *         email:
//  *           type: string
//  *           description: The user's email
//  *         username:
//  *           type: string
//  *           description: The user's display name
//  *         password:
//  *           type: string
//  *           description: The user's password (hashed, never returned in responses)
//  *         refreshTokens:
//  *           type: array
//  *           items:
//  *             type: string
//  *           description: List of valid refresh tokens
//  *         googleId:
//  *           type: string
//  *           description: Google ID for users authenticated via Google
//  *
//  *     LoginRequest:
//  *       type: object
//  *       required:
//  *         - email
//  *         - password
//  *       properties:
//  *         email:
//  *           type: string
//  *         password:
//  *           type: string
//  *
//  *     LoginResponse:
//  *       type: object
//  *       properties:
//  *         _id:
//  *           type: string
//  *         email:
//  *           type: string
//  *         username:
//  *           type: string
//  *         accessToken:
//  *           type: string
//  *         refreshToken:
//  *           type: string
//  *
//  *     RefreshRequest:
//  *       type: object
//  *       required:
//  *         - refreshToken
//  *       properties:
//  *         refreshToken:
//  *           type: string
//  *
//  *     RefreshResponse:
//  *       type: object
//  *       properties:
//  *         accessToken:
//  *           type: string
//  *         refreshToken:
//  *           type: string
//  *
//  *     GoogleAuthRequest:
//  *       type: object
//  *       required:
//  *         - token
//  *       properties:
//  *         token:
//  *           type: string
//  *           description: Google ID token
//  */

// /**
//  * @swagger
//  * /auth/register:
//  *   post:
//  *     summary: Register a new user
//  *     tags: [Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - email
//  *               - password
//  *             properties:
//  *               email:
//  *                 type: string
//  *                 format: email
//  *                 description: User's email address
//  *               username:
//  *                 type: string
//  *                 description: User's display name (optional, defaults to email username)
//  *               password:
//  *                 type: string
//  *                 format: password
//  *                 description: User's password
//  *     responses:
//  *       201:
//  *         description: User registered successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/User'
//  *       400:
//  *         description: Bad request - Invalid input or user already exists
//  *       500:
//  *         description: Server error
//  */
// router.post("/register", authController.register);
// router.post("/google-login", authController.googleAuth);
// /**
//  * @swagger
//  * /auth/login:
//  *   post:
//  *     summary: Log in a user
//  *     tags: [Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/LoginRequest'
//  *     responses:
//  *       200:
//  *         description: User logged in successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/LoginResponse'
//  *       400:
//  *         description: Invalid credentials
//  *       404:
//  *         description: User not found
//  *       500:
//  *         description: Server error
//  */
// router.post("/login", authController.login);

// /**
//  * @swagger
//  * /auth/logout:
//  *   post:
//  *     summary: Log out a user
//  *     tags: [Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - refreshToken
//  *             properties:
//  *               refreshToken:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: User logged out successfully
//  *       400:
//  *         description: Invalid refresh token
//  *       403:
//  *         description: Unauthorized
//  *       404:
//  *         description: User not found
//  */
// router.post("/logout", authController.logout);

// /**
//  * @swagger
//  * /auth/refresh:
//  *   post:
//  *     summary: Refresh the authentication token
//  *     tags: [Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/RefreshRequest'
//  *     responses:
//  *       200:
//  *         description: Token refreshed successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/RefreshResponse'
//  *       400:
//  *         description: Invalid refresh token
//  *       403:
//  *         description: Unauthorized
//  *       404:
//  *         description: User not found
//  */
// router.post("/refresh", authController.refresh);
// router.put("/users/:userId", authMiddleware, authController.updateUser);

// export default router;
