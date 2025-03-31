import { Request, Response } from "express";

export const handleUpload = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    // יצירת URL לגישה לתמונה
    const fileUrl = `${
      process.env.DOMAIN_BASE || "http://localhost:3000"
    }/uploads/${file.filename}`;

    res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed" });
  }
};
export const uploadProfileImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
};
