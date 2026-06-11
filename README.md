# ClipCam

An intelligent full-stack mobile application that acts as the "Shazam for video content." Built using React Native (Expo), React Native Vision Camera, and a Node.js/Express backend integrated with the Google Gemini 2.5 Flash API, ClipCam captures sequential camera snapshots of a video screen and identifies the film, TV series, or notable online video playing in real time.

---

##  Features

- **Sequential Frame Analysis:** Captures 4 high-fidelity snapshots spaced 350ms apart to model scene changes and tracking shots accurately.
- **Structured AI Interpretation:** Leverages Gemini 2.5 Flash to analyze set design, actors, wardrobe, UI layout, and visual cues, outputting clean structured JSON.
- **Dynamic Mobile Interface:** Minimalist, performance-focused React Native layout optimized with asynchronous UI state transitions and quick-action triggers.

---

##  Tech Stack

### Frontend
- **Framework:** Expo (React Native)
- **Hardware Layer:** React Native Vision Camera (v4)
- **File System:** Expo FileSystem (Base64 data packaging)

### Backend
- **Runtime:** Node.js / Express
- **AI Core:** Google Gen AI SDK (`gemini-2.5-flash`)
- **Middleware:** CORS, Express JSON Parser (50MB Payload threshold)

---

##  Installation & Setup

### Prerequisites
- **Node.js** (v18+)
- **Android Studio** (with an active Virtual Device / Emulator or physical device)
- **Java Development Kit (JDK 17 or 21)** configured in your environment pathing (`JAVA_HOME`)
- **Gemini API Key** from Google AI Studio

---

## How it Works
Capture Loop: When the CLIPCAM button is pushed, the app takes 4 sequential frame snapshots using the native hardware camera layer.

Data Packaging: The files are written locally to the app cache, verified via file:// scheme URIs, and converted cleanly to Base64 packages.

Network Bridge: The payloads are dispatched as a unified POST block across the internal loopback adapter to the Node.js Express router.

LLM Analysis: The server transforms the payloads into raw image components and issues a structured, typed schema completion request to Gemini 2.5 Flash.

UI Update: The application parses the structured JSON return values to display high-confidence match data, episode context, visual cues, and scenic breakdowns directly on the client view.

---

## License
This project is open source and available under the MIT License.
