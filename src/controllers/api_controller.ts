import axios from "axios";
import * as fs from "fs";
import * as path from "path";

export async function generateImage(movieName: string): Promise<string | null> {
  try {
    const base = process.env.DOMAIN_BASE + "/";

    const response = await axios.post(
      "https://api.openai.com/v1/images/generations",
      {
        model: "dall-e-2",
        prompt: `A visually striking movie poster for the film ${movieName}, inspired by the iconic classic Hollywood poster design. The composition should be cinematic and dramatic, with the main characters posed heroically, prominently showcasing their iconic costumes and expressions. Use dynamic, high-contrast lighting to emphasize the characters and create a sense of depth. ${movieName} should be boldly displayed in vintage, stylized typography at the center, with a tagline or slogan below. The background should reflect the genre and mood of the film, incorporating elements like scenic landscapes, urban settings, or action-packed sequences, while using a color palette that enhances the emotional tone of the movie (e.g., dark and moody for a thriller, vibrant and colorful for a comedy). Include subtle details to evoke the film's era and atmosphere, such as film grain or retro design elements.`,
        n: 1,
        size: "1024x1024",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.data && response.data.data[0].url) {
      const imageUrl = response.data.data[0].url; // קח את ה-URL של התמונה

      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer", // מבקש את התמונה כ-arraybuffer
      });

      const filename = `${Date.now()}_${movieName.replace(
        /[^a-z0-9]/gi,
        "_"
      )}.png`;

      const baseDir = "/home/st111/As1";
      const uploadDir = path.resolve(baseDir, "poststorage");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, imageResponse.data); // שמור את התמונה כקובץ

      console.log("Generated image saved at:", filePath);
      return `${base}poststorage/${filename}`;
    } else {
      console.error("No image URL received or invalid content type.");
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error generating image:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unknown error:", error);
    }
    return null;
  }
}
