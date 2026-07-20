import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware with payload limits for base64 image transmissions
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// ----------------------------------------------------
// API ENDPOINTS
// ----------------------------------------------------


/**
 * Premium OCR endpoint proxying cropped screenshots to Gemini 3.5 Flash
 */
app.post("/api/ocr", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const { imageBase64 } = req.body;

  if (!apiKey) {
    return res.status(200).json({
      success: false,
      message: "Gemini API key is missing. Please add your GEMINI_API_KEY in Settings > Secrets."
    });
  }

  if (!imageBase64) {
    return res.status(400).json({ success: false, message: "No image payload provided" });
  }

  try {
    // Initialize GoogleGenAI SDK lazily as per rules
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    // Strip out base64 URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType: "image/png",
        data: cleanBase64,
      }
    };

    const textPart = {
      text: "You are a precise on-device OCR engine. Extract and transcribe all the visible English or Latin text from this cropped screenshot of a phone screen. Return ONLY the transcribed text. Do not add markdown formatting, headers, markdown code fences, commentary, or explanation. If there is no legible text, return nothing."
    };

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] }
    });

    const text = result.text || "";
    return res.json({ success: true, text: text.trim() });
  } catch (error: any) {
    console.error("Gemini OCR operation failed:", error);
    return res.status(500).json({
      success: false,
      message: `Gemini OCR request failed: ${error.message || "Unknown error"}`
    });
  }
});

// ----------------------------------------------------
// FRONTEND BUNDLING / DEVELOPMENT MIDDLEWARE
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // In dev mode, let Vite handle client-side asset compiling and HMR fallback
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets from dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Orbit server successfully launched at http://localhost:${PORT}`);
  });
}

startServer();
