import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables from .env file
dotenv.config();

const app = express();

// Set up middleware
// ClipCam sends base64 image strings, which can be large. Increase limits to prevent 413 Payload Too Large errors.
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize the Google Gen AI SDK. It automatically utilizes process.env.GEMINI_API_KEY
const ai = new GoogleGenAI();

/**
 * 1. Define the Structured Output Schema
 * This forces Gemini to respond in raw, minified JSON matching this exact blueprint.
 * No markdown syntax blocks (```json), no conversational preamble.
 */
const clipCamSchema = {
  type: Type.OBJECT,
  properties: {
    found: { 
      type: Type.BOOLEAN, 
      description: "True if the content in the video frames was confidently identified." 
    },
    title: { 
      type: Type.STRING, 
      description: "The name of the Movie, TV Show, or YouTube Video. Leave empty if found is false." 
    },
    type: { 
      type: Type.STRING, 
      description: "Must be exactly one of: 'Movie', 'TV Show', 'YouTube Video', or 'Unknown'." 
    },
    year: { 
      type: Type.STRING, 
      description: "The release year (e.g., '2024')." 
    },
    season_episode: { 
      type: Type.STRING, 
      description: "If applicable, specify season and episode (e.g., 'S03E12')." 
    },
    confidence: { 
      type: Type.STRING, 
      description: "Must be exactly one of: 'High', 'Medium', or 'Low'." 
    },
    scene_description: { 
      type: Type.STRING, 
      description: "A short, 1-2 sentence breakdown of what is happening in the captured frames." 
    },
    visual_clues: { 
      type: Type.STRING, 
      description: "Specific details spotted that yielded this match (e.g., 'Actor Brad Pitt present, neon blue color grading, subway car environment')." 
    },
    not_found_reason: { 
      type: Type.STRING, 
      description: "If found is false, provide a brief reason why (e.g., 'Frames too blurry', 'User generated vlog context', 'Obscure angle')." 
    },
  },
  required: ["found", "confidence", "type"],
};

/**
 * 2. Define the Identification Endpoint
 * POST /identify
 */
app.post('/identify', async (req, res) => {
  const { frames } = req.body;

  // Edge-case handling: ensure frames actually arrived from the mobile app
  if (!frames || !Array.isArray(frames) || frames.length === 0) {
    return res.status(400).json({ 
      error: "Bad Request: No sequential video frames received." 
    });
  }

  try {
    console.log(`🎬 Received ${frames.length} frames from ClipCam. Processing with Gemini 2.5 Flash...`);

    // Map the incoming array of raw base64 data into the structural format Gemini expects
    const imageParts = frames.map((base64Str) => ({
      inlineData: {
        data: base64Str,
        mimeType: "image/jpeg"
      }
    }));

    // Generate completion request using Google Gen AI SDK
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [
        ...imageParts,
        {
          text: "Analyze these sequential camera snapshots captured from a video screen. Identify what movie, TV series, or notable YouTube video is playing based on actors, set design, wardrobe, UI layout, or visible text.",
        },
      ],
      config: {
        systemInstruction: "You are the backend visual processing core of ClipCam—the Shazam for video content. Your primary objective is precise, ultra-fast matching. Rely solely on visual data provided. Populate the requested JSON schema faithfully.",
        responseMimeType: "application/json",
        responseSchema: clipCamSchema,
      },
    });

    // The SDK guarantees response.text is strings matching your schema structure natively
    const clipCamData = JSON.parse(response.text);
    console.log(`✅ Analysis Complete. Identified: ${clipCamData.found ? clipCamData.title : "Not Found"}`);
    
    return res.json(clipCamData);

  } catch (error) {
    console.error("❌ Backend Processing Error:", error);
    return res.status(500).json({ 
      error: "Internal Server Error: Failed to safely parse scene visuals." 
    });
  }
});

// Start listening for mobile app traffic
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 ClipCam Backend Engine live on http://localhost:${PORT}`);
});