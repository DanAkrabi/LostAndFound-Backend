"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.authMiddleware = void 0;
const users_model_1 = __importDefault(require("../models/users_model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configure Google OAuth client
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
/**
 * Generates access and refresh tokens for a user
 */
const generateTokens = (userId) => {
    // Generate random values for token uniqueness
    const randomValue = Math.floor(Math.random() * 1000000);
    if (!process.env.TOKEN_SECRET) {
        return null;
    }
    const accessToken = jsonwebtoken_1.default.sign({ _id: userId, random: randomValue }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRATION || "1h",
    });
    const refreshToken = jsonwebtoken_1.default.sign({ _id: userId, random: randomValue }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || "7d",
    });
    return { accessToken, refreshToken };
};
/**
 * User registration handler
 */
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username } = req.body;
    // Validate required fields
    if (!email || !password) {
        res.status(400).send("Email and password are required");
        return;
    }
    try {
        // Check if user already exists
        const existingUser = yield users_model_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).send("User with this email already exists");
            return;
        }
        // Hash password
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        // Create user
        const user = yield users_model_1.default.create({
            email,
            password: hashedPassword,
            username: username || email.split("@")[0], // Default username if not provided
        });
        res.status(201).send(user);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
/**
 * Handle Google authentication
 */
const googleAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    if (!token) {
        res.status(400).send("Google token is required");
        return;
    }
    try {
        // Verify the Google ID token
        const ticket = yield googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(400).send("Invalid Google token");
            return;
        }
        // Find or create user
        let user = yield users_model_1.default.findOne({ email: payload.email });
        if (!user) {
            // Create new user from Google data
            const username = payload.email.split("@")[0];
            user = yield users_model_1.default.create({
                email: payload.email,
                username,
                // No password for Google users
                googleId: payload.sub,
            });
        }
        // Generate authentication tokens
        const tokens = generateTokens(user._id.toString());
        if (!tokens) {
            res.status(500).send("Failed to generate authentication tokens");
            return;
        }
        // Store refresh token
        if (!user.refreshTokens) {
            user.refreshTokens = [];
        }
        user.refreshTokens.push(tokens.refreshToken);
        yield user.save();
        // Return user info and tokens
        res.status(200).send({
            _id: user._id,
            email: user.email,
            username: user.id,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    }
    catch (error) {
        console.error("Google authentication error:", error);
        res.status(500).send("Failed to authenticate with Google");
    }
});
/**
 * User login handler
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername ||
        !password ||
        emailOrUsername.trim().length === 0 ||
        password.trim().length === 0) {
        res.status(400).send("Email and Password are required");
        return;
    }
    try {
        const user = yield users_model_1.default.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
        });
        if (!user) {
            res.status(400).send("Check email/username or password");
            return;
        }
        // Check if user has a password (might be a Google auth user)
        if (!user.password) {
            res.status(400).send("This account uses Google authentication");
            return;
        }
        const validPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            res.status(400).send("Check email/username or password");
            return;
        }
        const tokens = generateTokens(user._id.toString());
        if (!tokens) {
            res.status(500).send("Cannot Generate Tokens");
            return;
        }
        if (user.refreshTokens == null) {
            user.refreshTokens = [];
        }
        user.refreshTokens.push(tokens.refreshToken);
        yield user.save();
        console.log("Login Valid");
        res.status(200).send({
            email: user.email,
            _id: user._id,
            imagePath: user.imagePath,
            username: user.username,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
        return;
    }
    catch (err) {
        res.status(400).send(err);
        return;
    }
});
/**
 * Authentication middleware
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.header("authorization");
    if (!authHeader) {
        res.status(401).send("Access Denied: No token provided");
        return;
    }
    const token = authHeader.split(" ")[1]; // Extract token from "Bearer {token}"
    if (!token) {
        res.status(401).send("Access Denied: Invalid token format");
        return;
    }
    if (!process.env.TOKEN_SECRET) {
        res.status(500).send("Server Error: Missing token configuration");
        return;
    }
    try {
        const verified = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
        req.params.userId = verified._id;
        next();
    }
    catch (error) {
        res.status(401).send("Access Denied: Invalid token");
    }
};
exports.authMiddleware = authMiddleware;
/**
 * User logout handler
 */
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).send("Refresh token is required");
        return;
    }
    if (!process.env.TOKEN_SECRET) {
        res.status(500).send("Server Error: Missing token configuration");
        return;
    }
    try {
        // Verify token
        const payload = jsonwebtoken_1.default.verify(refreshToken, process.env.TOKEN_SECRET);
        // Find user
        const user = yield users_model_1.default.findById(payload._id);
        if (!user) {
            res.status(404).send("User not found");
            return;
        }
        // Check if token exists in user's refresh tokens
        if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
            // Clear all tokens if suspicious activity
            user.refreshTokens = [];
            yield user.save();
            res.status(403).send("Invalid token");
            return;
        }
        // Remove this refresh token
        user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
        yield user.save();
        res.status(200).send("Successfully logged out");
    }
    catch (error) {
        res.status(400).send("Invalid token");
    }
});
/**
 * Token refresh handler
 */
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).send("Refresh token is required");
        return;
    }
    if (!process.env.TOKEN_SECRET) {
        res.status(500).send("Server Error: Missing token configuration");
        return;
    }
    try {
        // Verify token
        const payload = jsonwebtoken_1.default.verify(refreshToken, process.env.TOKEN_SECRET);
        // Find user
        const user = yield users_model_1.default.findById(payload._id);
        if (!user) {
            res.status(404).send("User not found");
            return;
        }
        // Check if token exists in user's refresh tokens
        if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
            // Clear all tokens if suspicious activity
            user.refreshTokens = [];
            yield user.save();
            res.status(403).send("Invalid token");
            return;
        }
        // Generate new tokens
        const newTokens = generateTokens(user._id.toString());
        if (!newTokens) {
            res.status(500).send("Failed to generate tokens");
            return;
        }
        // Remove old refresh token
        user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
        // Add new refresh token
        user.refreshTokens.push(newTokens.refreshToken);
        yield user.save();
        // Return new tokens
        res.status(200).send({
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
        });
    }
    catch (error) {
        res.status(400).send("Invalid token");
    }
});
const decodeToken = (token) => {
    try {
        if (!process.env.TOKEN_SECRET) {
            throw new Error("Missing Token Secret");
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
        return decoded._id; // Return the user ID from the token payload
    }
    catch (error) {
        return null; // If there's an error, return null
    }
};
exports.decodeToken = decodeToken;
exports.default = { register, login, logout, refresh, googleAuth };
//# sourceMappingURL=auth_controller.js.map