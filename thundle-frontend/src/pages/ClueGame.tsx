/* ─────────────────────────────────────────
   ClueGame.tsx  —  One vehicle per day/mode
   ───────────────────────────────────────── */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ModeSelector from "../components/ModeSelector";
import { usePersistentState } from "../hooks/usePersistentState";
import "./ClueGame.css";

/* ───────────── Types ───────────── */
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

type ClueKey =
  | "name"
  | "image"
  | "country"
  | "type"
  | "tier"
  | "br"
  | "premium"
  | "event"
  | "marketplace"
  | "squadron";

/* ─────────── Config ─────────── */
const CLUE_COST: Record<ClueKey, number> = {
  name: 20,
  image: 30,
  country: 10,
  type: 10,
  tier: 5,
  br: 5,
  premium: 5,
  event: 5,
  marketplace: 5,
  squadron: 5,
};

const DEFAULT_REVEALED: Record<ClueKey, boolean> = {
  name: false,
  image: false,
  country: false,
  type: false,
  tier: false,
  br: false,
  premium: false,
  event: false,
  marketplace: false,
  squadron: false,
};

const MAX_POINTS = 100;
const API_BASE = import.meta.env.VITE_THUNDLE_API ?? "";

/* helper: YYYY‑MM‑DD in Europe/Berlin */
const berlinDate = (): string =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Berlin" });

/* ─────────── Component ─────────── */
export default function ClueGame() {
  const nav = useNavigate();
  const { mode = "all" } = useParams<"mode">();
  const today = berlinDate();
  const [loading, setLoading] = useState(true);

  /* cache keys */
  const vehicleKey   = `clue-${mode}-vehicle-${today}`;
  const answerKey    = `clue-${mode}-answer-${today}`;
  const pointsKey    = `clue-${mode}-points-${today}`;
  const revealedKey  = `clue-${mode}-revealed-${today}`;

  /* state */
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [points, setPoints] = usePersistentState(pointsKey, MAX_POINTS);
  const [revealed, setRevealed] = usePersistentState<Record<ClueKey, boolean>>(
    revealedKey,
    DEFAULT_REVEALED
  );
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([]);

  /* fetch / load vehicle of the day */
  useEffect(() => {
    async function initVehicle() {
      setLoading(true);
      const cachedV = localStorage.getItem(vehicleKey);
      const cachedA = localStorage.getItem(answerKey);

      if (cachedV && cachedA) {
        setVehicle(JSON.parse(cachedV));
        setCorrectAnswer(cachedA);
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get<Vehicle>(`${API_BASE}/random`, {
          params: { 
            "mode": mode, 
            "game": "clue" 
          }
        });
        setVehicle(data);
        setCorrectAnswer(data.name.toLowerCase());
        localStorage.setItem(vehicleKey, JSON.stringify(data));
        localStorage.setItem(answerKey, data.name.toLowerCase());
      } catch (err) {
        setMessage("Failed to load vehicle.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    initVehicle();
  }, [mode, today]);

  /* reset daily progress on mode/date change */
  useEffect(() => {
    const existingRevealed = localStorage.getItem(revealedKey);
    const existingPoints = localStorage.getItem(pointsKey);

    if (!existingRevealed || !existingPoints) {
      setRevealed(DEFAULT_REVEALED);
      setPoints(MAX_POINTS);
    }

    setGuess("");
    setMessage("");
  }, [mode, today]);

  /* fetch vehicle names for datalist (not cached daily) */
  useEffect(() => {
    axios
      .get<VehicleOption[]>(`${API_BASE}/names`, { params: { mode } })
      .then((r) => setVehicleOptions(r.data))
      .catch(() => console.warn("Could not load names list"));
  }, [mode]);

  /* utils */
  const maskedName = (n: string) =>
    n
      .split("")
      .map((ch, i) => (i % 2 ? "_" : ch))
      .join("");
  const yesNo = (flag?: boolean) => (flag ? "Yes" : "No");

  /* reveal */
  const reveal = (key: ClueKey) => {
    if (revealed[key]) return;
    setRevealed({ ...revealed, [key]: true });
    setPoints((p) => Math.max(0, p - CLUE_COST[key]));
  };

  /* guess handler */
  const handleGuess = () => {
    if (!vehicle) return;
    if (guess.trim().toLowerCase() === correctAnswer) {
      setMessage(`Correct! You scored ${points} pts.`);
    } else {
      setMessage("Wrong guess, try again.");
    }
    setGuess("");
  };

  /* ─────────── JSX ─────────── */
  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-[300px]">
          <p className="text-gray-300">Loading vehicle...</p>
        </div>
      ) : (
        <>
          <div className="clue-game-container">
            <ModeSelector game="clue-game" />

            {/* datalist for autocomplete */}
            <datalist id="vehicle-options">
              {vehicleOptions.map((v) => (
                <option key={v._id} value={v.name} />
              ))}
            </datalist>

            {/* guess bar */}
            <div className="guess-bar">
              <button onClick={() => nav("/")} className="guess-submit">
                ← Home
              </button>
              <input
                className="guess-input"
                placeholder="Guess..."
                list="vehicle-options"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGuess()}
              />
              <button className="guess-submit" onClick={handleGuess}>
                →
              </button>
            </div>

            {/* points bar */}
            <div className="points-wrapper">
              <div
                className="points-bar"
                style={{ width: `${(points / MAX_POINTS) * 100}%` }}
              />
              <span className="points-label">{points}</span>
            </div>

            {/* clue grid */}
            <div className="clue-grid">
              {/* NAME */}
              <div
                className={`clue-card name-card ${revealed.name ? "revealed" : ""}`}
                title={!revealed.name ? `-${CLUE_COST.name} pts` : ""}
                onClick={() => reveal("name")}
              >
                <span className="clue-label">Name</span>
                {revealed.name && vehicle && maskedName(vehicle.name)}
              </div>

              {/* IMAGE */}
              <div
                className={`clue-card image-card ${revealed.image ? "revealed" : ""}`}
                title={!revealed.image ? `-${CLUE_COST.image} pts` : ""}
                onClick={() => reveal("image")}
              >
                <span className="clue-label">Image</span>
                {revealed.image && vehicle && (
                  <img src={vehicle.image_url} alt="vehicle" />
                )}
              </div>

              {/* COUNTRY / TYPE / TIER / BR */}
              <div
                className={`clue-card country-card ${revealed.country ? "revealed" : ""}`}
                title={!revealed.country ? `-${CLUE_COST.country} pts` : ""}
                onClick={() => reveal("country")}
              >
                <span className="clue-label">Country</span>
                {revealed.country && vehicle?.country}
              </div>
              <div
                className={`clue-card type-card ${revealed.type ? "revealed" : ""}`}
                title={!revealed.type ? `-${CLUE_COST.type} pts` : ""}
                onClick={() => reveal("type")}
              >
                <span className="clue-label">Type</span>
                {revealed.type && vehicle?.vehicle_type}
              </div>
              <div
                className={`clue-card tier-card ${revealed.tier ? "revealed" : ""}`}
                title={!revealed.tier ? `-${CLUE_COST.tier} pts` : ""}
                onClick={() => reveal("tier")}
              >
                <span className="clue-label">Tier</span>
                {revealed.tier && vehicle?.tier}
              </div>
              <div
                className={`clue-card br-card ${revealed.br ? "revealed" : ""}`}
                title={!revealed.br ? `-${CLUE_COST.br} pts` : ""}
                onClick={() => reveal("br")}
              >
                <span className="clue-label">Battle Rating</span>
                {revealed.br && vehicle?.realistic_br}
              </div>

              {/* FLAGS */}
              <div
                className={`clue-card premium-card ${revealed.premium ? "revealed" : ""}`}
                title={!revealed.premium ? `-${CLUE_COST.premium} pts` : ""}
                onClick={() => reveal("premium")}
              >
                <span className="clue-label">Premium?</span>
                {revealed.premium && yesNo(vehicle?.is_premium)}
              </div>
              <div
                className={`clue-card event-card ${revealed.event ? "revealed" : ""}`}
                title={!revealed.event ? `-${CLUE_COST.event} pts` : ""}
                onClick={() => reveal("event")}
              >
                <span className="clue-label">Event?</span>
                {revealed.event && yesNo(vehicle?.is_event)}
              </div>
              <div
                className={`clue-card marketplace-card ${revealed.marketplace ? "revealed" : ""}`}
                title={!revealed.marketplace ? `-${CLUE_COST.marketplace} pts` : ""}
                onClick={() => reveal("marketplace")}
              >
                <span className="clue-label">Marketplace?</span>
                {revealed.marketplace && yesNo(vehicle?.is_marketplace)}
              </div>
              <div
                className={`clue-card squadron-card ${revealed.squadron ? "revealed" : ""}`}
                title={!revealed.squadron ? `-${CLUE_COST.squadron} pts` : ""}
                onClick={() => reveal("squadron")}
              >
                <span className="clue-label">Squadron?</span>
                {revealed.squadron && yesNo(vehicle?.is_squadron)}
              </div>
            </div>

            {message && <p className="message">{message}</p>}
          </div>
        </>
      )}
    </>
  );
}
