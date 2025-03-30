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
