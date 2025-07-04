/*
 * Adapted React frontend for the **Thundle Internal API**.
 * -------------------------------------------------------
 * - Replaces the static `movies` dataset with live data from the FastAPI backend.
 * - Uses Axios to talk to `/random` and `/vehicles` endpoints.
 * - Keeps the existing modal/layout/notification structure so your current
 *   components continue to work with minimal changes.
 */

import {
  useEffect,
  useState,
} from "react";
import axios from "axios";

// ────────────────────────────────────────────────────────────
// 🔸 Types ───────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────

export interface Vehicle {
  _id: string;
  country: string;
  vehicle_type: string;
  tier: number;
  realistic_br: number;
  realistic_ground_br: number;
  is_event: boolean;
  release_date: string;
  is_premium: boolean;
  is_pack: boolean;
  is_marketplace: boolean;
  is_squadron: boolean;
  image_url: string;
  mode: string;
  name: string;
  description: string;
}

// ────────────────────────────────────────────────────────────
// 🔸 Environment & Helpers ──────────────────────────────────
// ────────────────────────────────────────────────────────────

/**
 * Base URL for the FastAPI backend.
 * Configure this in a Vite/CRA env file, e.g. `THUNDLE_API=http://localhost:8000`.
 */
const API_BASE = import.meta.env.VITE_THUNDLE_API ?? "";

// ────────────────────────────────────────────────────────────
// 🔸 Main App Component ──────────────────────────────────────
// ────────────────────────────────────────────────────────────

const BLUR_LEVELS = [
  "blur-10px",
  "blur-7-5px",
  "blur-5px",
  "blur-2-5px",
  "blur-none"
];

const guessesAllowed = BLUR_LEVELS.length - 1;

function App() {
  const [blurIndex, setBlurIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [imageUrl, setImageUrl] = useState(null);

   useEffect(() => {
    async function fetchVehicle() {
      try {
        console.log("Fetching vehicle response...");
        const response = await axios.get(`${API_BASE}/random`, { params: { mode: "ground" } });
        const data = response.data;
        setCorrectAnswer(data.name.toLowerCase());
        setImageUrl(data.image_url);
      } catch (error) {
        setMessage("Failed to load tank data.");
        console.error("Error fetching vehicle:", error);
      }
    }
    fetchVehicle();
  }, []);

  const handleGuess = () => {
    const cleanGuess = guess.trim().toLowerCase();

    if (cleanGuess === correctAnswer) {
      setMessage("Correct! You guessed it!");
      setBlurIndex(BLUR_LEVELS.length - 1);
    } else {
      if (blurIndex < guessesAllowed) {
        setBlurIndex(blurIndex + 1);
        setMessage("Incorrect. Try again.");
      } else {
        setBlurIndex(blurIndex + 1);
        setMessage(`Out of guesses! The answer was: ${correctAnswer}`);
      }
    }
    setGuess("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Tank Guessing Game</h1>

      <div className="w-full max-w-lg">
        <div className="w-full aspect-video overflow-hidden border border-gray-700 rounded-lg">
          <img
            src={imageUrl}
            alt="Guess the tank"
            className={`w-full h-full object-cover transition-all duration-500 ${BLUR_LEVELS[blurIndex]}`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            className="flex-1 px-4 py-2 text-black rounded"
            placeholder="Enter your guess"
          />
          <button
            onClick={handleGuess}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            disabled={!imageLoaded || blurIndex > BLUR_LEVELS.length - 1}
          >
            Guess
          </button>
        </div>

        {message && <p className="mt-4 text-center text-lg">{message}</p>}
      </div>
    </div>
  );
}

export default App;
