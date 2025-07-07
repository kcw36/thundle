/*
 * React frontend for the **Thundle Internal API**.
 * -------------------------------------------------------
 * - Uses Axios to talk to `/random` and `/vehicles` endpoints.
 * - Keeps the existing modal/layout/notification structure so your current
 *   components continue to work with minimal changes.
 */
import {
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import ModeSelector from "../components/ModeSelector";
import { usePersistentState } from "../hooks/usePersistentState";
import "./BlurGame.css"

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

export interface VehicleOption {
  _id: string;
  name: string;
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

function BlurGame() {
  const { mode = "all" } = useParams<"mode">();
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Berlin" });
  const blurKey = `blur-${mode}-blurIndex-${today}`;
  const messageKey = `blur-${mode}-message-${today}`;

  const [blurIndex, setBlurIndex] = usePersistentState<number>(blurKey, 0);
  const [message, setMessage]     = usePersistentState<string>(messageKey, "");

  const [guess, setGuess]         = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [imageUrl, setImageUrl] = useState();
  const [vehicleOptions, setVehicleNames] = useState<VehicleOption[]>([]);
  const navigate = useNavigate();

  function getBerlinDateString(): string {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Berlin" }); // "YYYY-MM-DD"
  }

  useEffect(() => {
    async function fetchOrLoadVehicle() {
      setLoading(true);
      const today = getBerlinDateString();
      const cacheKey = `blur-${mode}-data-${today}`;

      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setCorrectAnswer(parsed.correctAnswer);
        setImageUrl(parsed.imageUrl);
        setLoading(false);
        return;
      }

      // Not cached, so fetch
      try {
        const response = await axios.get(`${API_BASE}/random`, {
          params: { mode }
        });
        const data = response.data;

        setCorrectAnswer(data.name.toLowerCase());
        setImageUrl(data.image_url);

        localStorage.setItem(cacheKey, JSON.stringify({
          correctAnswer: data.name.toLowerCase(),
          imageUrl: data.image_url
        }));
      } catch (error) {
        setMessage("Failed to load vehicle.");
        console.error("Fetch failed:", error);
      } finally {
        setLoading(false)
      }
    }

    fetchOrLoadVehicle();
  }, [mode]);

  useEffect(() => {
    async function fetchAllNames() {
      try {
        const { data } = await axios.get<VehicleOption[]>(`${API_BASE}/names`, {
          params: { mode },
        });
        setVehicleNames(data);
      } catch (err) {
        console.error("Could not load vehicle names for autocomplete:", err);
      }
    }
    fetchAllNames();
  }, [mode]);

  useEffect(() => {
    const existingBlur = localStorage.getItem(blurKey);
    const existingMsg = localStorage.getItem(messageKey);

    if (!existingBlur || !existingMsg) {
      setBlurIndex(0);
      setMessage("");
    }

    setGuess("");
  }, [mode, today]);

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
    <>
      {loading ? (
        <div className="flex justify-center items-center h-[300px]">
          <p className="text-gray-300">Loading vehicle...</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <ModeSelector game="blur-game" />
            <h1 className="text-3xl font-bold mb-4">Blurdle: {mode}</h1>

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
                  list="vehicle-options"
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

              <datalist id="vehicle-options">
                {vehicleOptions.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle.name} />
                ))}
              </datalist>

              {message && <p className="mt-4 text-center text-lg">{message}</p>}

              <button
                  onClick={() => navigate("/")}
                  className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700 transition"
              >
                  ← Return to Home
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default BlurGame;
