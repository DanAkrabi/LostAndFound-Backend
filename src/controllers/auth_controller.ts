import { NextFunction, Request, Response } from "express";
import userModel from "../models/users_model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

// Configure Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Type definitions
type TokenPayload = {
  _id: string;
  random?: number;
};

/**
 * Generates access and refresh tokens for a user
 */
const generateTokens = (
  userId: string
): { accessToken: string; refreshToken: string } | null => {
  // Generate random values for token uniqueness
  const randomValue = Math.floor(Math.random() * 1000000);

  if (!process.env.TOKEN_SECRET) {
    return null;
  }

  const accessToken = jwt.sign(
    { _id: userId, random: randomValue },
    process.env.TOKEN_SECRET,
    {
      expiresIn: process.env.TOKEN_EXPIRATION || "1h",
    }
  );

  const refreshToken = jwt.sign(
    { _id: userId, random: randomValue },
    process.env.TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || "7d",
    }
  );

  return { accessToken, refreshToken };
};

/**
 * User registration handler
 */
const register = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  // Validate required fields
  if (!email || !password) {
    res.status(400).send("Email and password are required");
    return;
  }

  try {
    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      res.status(400).send("User with this email already exists");
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await userModel.create({
      email,
      password: hashedPassword,
      username: username || email.split("@")[0], // Default username if not provided
    });

    res.status(201).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Handle Google authentication
 */
const googleAuth = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    res.status(400).send("Google token is required");
    return;
  }

  try {
    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).send("Invalid Google token");
      return;
    }

    // Find or create user
    let user = await userModel.findOne({ email: payload.email });

    if (!user) {
      // Create new user from Google data
      const username = payload.email.split("@")[0];

      user = await userModel.create({
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
    await user.save();

    // Return user info and tokens
    res.status(200).send({
      _id: user._id,
      email: user.email,
      username: user.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error("Google authentication error:", error);
    res.status(500).send("Failed to authenticate with Google");
  }
};

/**
 * User login handler
 */
const login = async (req: Request, res: Response) => {
  const { emailOrUsername, password } = req.body;

  if (
    !emailOrUsername ||
    !password ||
    emailOrUsername.trim().length === 0 ||
    password.trim().length === 0
  ) {
    res.status(400).send("Email and Password are required");
    return;
  }
  try {
    const user = await userModel.findOne({
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

    const validPassword = await bcrypt.compare(password, user.password);
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
    await user.save();

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
  } catch (err) {
    res.status(400).send(err);
    return;
  }
};
/**
 * Authentication middleware
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    const verified = jwt.verify(
      token,
      process.env.TOKEN_SECRET
    ) as TokenPayload;
    req.params.userId = verified._id;
    next();
  } catch (error) {
    res.status(401).send("Access Denied: Invalid token");
  }
};

/**
 * User logout handler
 */
const logout = async (req: Request, res: Response) => {
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
    const payload = jwt.verify(
      refreshToken,
      process.env.TOKEN_SECRET
    ) as TokenPayload;

    // Find user
    const user = await userModel.findById(payload._id);
    if (!user) {
      res.status(404).send("User not found");
      return;
    }

    // Check if token exists in user's refresh tokens
    if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
      // Clear all tokens if suspicious activity
      user.refreshTokens = [];
      await user.save();
      res.status(403).send("Invalid token");
      return;
    }

    // Remove this refresh token
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken
    );

    await user.save();
    res.status(200).send("Successfully logged out");
  } catch (error) {
    res.status(400).send("Invalid token");
  }
};

/**
 * Token refresh handler
 */
const refresh = async (req: Request, res: Response) => {
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
    const payload = jwt.verify(
      refreshToken,
      process.env.TOKEN_SECRET
    ) as TokenPayload;

    // Find user
    const user = await userModel.findById(payload._id);
    if (!user) {
      res.status(404).send("User not found");
      return;
    }

    // Check if token exists in user's refresh tokens
    if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
      // Clear all tokens if suspicious activity
      user.refreshTokens = [];
      await user.save();
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
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken
    );

    // Add new refresh token
    user.refreshTokens.push(newTokens.refreshToken);
    await user.save();

    // Return new tokens
    res.status(200).send({
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    });
  } catch (error) {
    res.status(400).send("Invalid token");
  }
};
export const decodeToken = (token: string): string | null => {
  try {
    if (!process.env.TOKEN_SECRET) {
      throw new Error("Missing Token Secret");
    }
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET) as TokenPayload;
    return decoded._id; // Return the user ID from the token payload
  } catch (error) {
    return null; // If there's an error, return null
  }
};
export default { register, login, logout, refresh, googleAuth };
