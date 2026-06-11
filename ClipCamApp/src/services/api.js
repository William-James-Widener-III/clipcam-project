// Android emulators look at this specific IP address to route traffic back to your laptop
const LOCAL_BACKEND_URL = 'http://10.0.2.2:5000/api/identify';

/**
 * Transmits collected camera snapshots to the local Node.js backend analysis engine.
 * @param {Array<string>} base64Frames - Array of Base64 image strings
 */
export default async function sendFramesToBackend(base64Frames) {
  try {
    const response = await fetch(LOCAL_BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        frames: base64Frames,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status code: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error dispatching frames to backend network route:', error);
    throw error;
  }
}