# ClipCam

An intelligent full-stack mobile application that acts as the "Shazam for video content." Built using React Native (Expo), React Native Vision Camera, and a Node.js/Express backend integrated with the Google Gemini 2.5 Flash API, ClipCam captures sequential camera snapshots of a video screen and identifies the film, TV series, or notable online video playing in real time.

---

## 🚀 Features

- **Sequential Frame Analysis:** Captures 4 high-fidelity snapshots spaced 350ms apart to model scene changes and tracking shots accurately.
- **Structured AI Interpretation:** Leverages Gemini 2.5 Flash to analyze set design, actors, wardrobe, UI layout, and visual cues, outputting clean structured JSON.
- **Dynamic Mobile Interface:** Minimalist, performance-focused React Native layout optimized with asynchronous UI state transitions and quick-action triggers.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Expo (React Native)
- **Hardware Layer:** React Native Vision Camera (v4)
- **File System:** Expo FileSystem (Base64 data packaging)

### Backend
- **Runtime:** Node.js / Express
- **AI Core:** Google Gen AI SDK (`gemini-2.5-flash`)
- **Middleware:** CORS, Express JSON Parser (50MB Payload threshold)

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js** (v18+)
- **Android Studio** (with an active Virtual Device / Emulator or physical device)
- **Java Development Kit (JDK 17 or 21)** configured in your environment pathing (`JAVA_HOME`)
- **Gemini API Key** from Google AI Studio

---

### Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd clipcam-backend