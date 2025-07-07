/* ─────────────────────────────────────────
   BlurGame.tsx
   Supports Daily  → /blur-game/:mode
            Archive → /blur-archive/:mode/:date
   ───────────────────────────────────────── */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ModeSelector from "../components/ModeSelector";
import { usePersistentState } from "../hooks/usePersistentState";


/* ───────────── Types ───────────── */
export interface Vehicle {
  _id: string;
  image_url: string;
  name: string;
}

export interface VehicleOption {
  _id: string;
  name: string;
}

/* ───────────── Config ───────────── */
const API_BASE = import.meta.env.VITE_THUNDLE_API ?? "";

const BLUR_LEVELS = ["blur-lg", "blur-md", "blur-sm", "blur-xs", "blur-none"];
const guessesAllowed = BLUR_LEVELS.length - 1;

/* helper: YYYY‑MM‑DD in Berlin */
const berlinDate = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Berlin" });

/* ───────────── Component ───────────── */
export default function BlurGame() {
  const { mode = "all", date } = useParams<"mode" | "date">();
  const isArchive      = Boolean(date);
  const today          = berlinDate();
  const gameDate       = isArchive ? (date as string) : today;        // key suffix

  /* persistent keys (mode + date) */
  const blurKey    = `blur-${mode}-blurIndex-${gameDate}`;
  const messageKey = `blur-${mode}-message-${gameDate}`;
  const dataKey    = isArchive
    ? `blur-${mode}-archive-${date}`
    : `blur-${mode}-daily-${today}`;

  /* state */
  const [loading, setLoading]       = useState(true);
  const [blurIndex, setBlurIndex]   = usePersistentState<number>(blurKey, 0);
  const [message, setMessage]       = usePersistentState<string>(messageKey, "");
  const [guess, setGuess]           = useState("");
  const [imageLoaded, setImgLoaded] = useState(false);
  const [correctAnswer, setAnswer]  = useState("");
  const [imageUrl, setImageUrl]     = useState<string>();
  const [names, setNames]           = useState<VehicleOption[]>([]);
  const nav = useNavigate();

  /* fetch vehicle: daily via /random, archive via /historic */
  useEffect(() => {
    async function loadVehicle() {
      setLoading(true);

      const cached = localStorage.getItem(dataKey);
      if (cached) {
        const v = JSON.parse(cached) as Vehicle;
        setAnswer(v.name.toLowerCase());
        setImageUrl(v.image_url);
        setLoading(false);
        return;
      }

      try {
        if (isArchive) {
          const { data } = await axios.get<Vehicle[]>(`${API_BASE}/historic`, {
            params: { date, game: "blur", mode }
          });
          if (data?.length) {
            const v = data[0];
            setAnswer(v.name.toLowerCase());
            setImageUrl(v.image_url);
            localStorage.setItem(dataKey, JSON.stringify(v));
          }
        } else {
          const { data } = await axios.get<Vehicle>(`${API_BASE}/random`, {
            params: { mode }
          });
          setAnswer(data.name.toLowerCase());
          setImageUrl(data.image_url);
          localStorage.setItem(dataKey, JSON.stringify(data));
        }
      } catch (err) {
        setMessage("Failed to load vehicle.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadVehicle();
  }, [mode, date]); // refetch if mode or archive‑date changes

  /* fetch autocomplete names (mode‑specific, no archive) */
  useEffect(() => {
    axios
      .get<VehicleOption[]>(`${API_BASE}/names`, { params: { mode } })
      .then((r) => setNames(r.data))
      .catch(() => setNames([]));
  }, [mode]);

  /* ensure guess/message reset when mode/date changes */
  useEffect(() => {
    const haveSaved = localStorage.getItem(blurKey);
    if (!haveSaved) setBlurIndex(0);

    setGuess("");
  }, [mode, date]);

  /* guess handler */
  const handleGuess = () => {
    if (!imageUrl) return;
    const clean = guess.trim().toLowerCase();
    if (clean === correctAnswer) {
      setMessage("Correct!");
      setBlurIndex(BLUR_LEVELS.length - 1);
    } else {
      const newIndex = Math.min(blurIndex + 1, BLUR_LEVELS.length - 1);
      setBlurIndex(newIndex);
      setMessage(newIndex === BLUR_LEVELS.length - 1
        ? `Out of guesses! Answer: ${correctAnswer}`
        : "Incorrect. Try again.");
    }
    setGuess("");
  };

  /* disable until ready */
  const disabled = loading || !imageLoaded || blurIndex >= guessesAllowed;

  /* ─────────── JSX ─────────── */
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-white p-4">
      <ModeSelector game={isArchive ? "blur-archive" : "blur-game"} />

      <h1 className="text-3xl font-bold mb-4">
        {isArchive ? "Blurdle Archive" : "Blurdle"}&nbsp;
        <span className="text-sm text-gray-400">({mode}{isArchive && ` · ${date}`})</span>
      </h1>

      <div className="w-full max-w-lg">
        {loading ? (
          <div className="flex justify-center items-center aspect-video border border-gray-700 rounded-lg">
            <p className="text-gray-400 italic">Loading…</p>
          </div>
        ) : (
          <div className="w-full aspect-video overflow-hidden rounded-lg">
            <img
              src={imageUrl}
              alt="Guess the vehicle"
              className={`w-full h-full object-cover transition-all duration-500 ${BLUR_LEVELS[blurIndex]}`}
              onLoad={() => setImgLoaded(true)}
            />
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            list="vehicle-options"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            className="flex-1 px-4 py-2 text-white bg-accent rounded"
            placeholder="Enter your guess"
            disabled={disabled}
          />
          <button
            onClick={handleGuess}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-40"
            disabled={disabled}
          >
            Guess
          </button>
        </div>

        <datalist id="vehicle-options">
          {names.map((v) => (
            <option key={v._id} value={v.name} />
          ))}
        </datalist>

        {message && <p className="mt-4 text-center text-lg">{message}</p>}

        <button
          onClick={() => nav("/")}
          className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700"
        >
          ← Home
        </button>
      </div>
    </div>
  );
}
