import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

/* 10 clues */
type ClueKey =
  | "name"
  | "image"
  | "country"
  | "type"
  | "tier"
  | "br"
  | "premium"
  | "event"
  | "marketplace";

/* Point cost per clue */
const CLUE_COST: Record<ClueKey, number> = {
  name: 20,
  image: 10,
  country: 10,
  type: 10,
  tier: 5,
  br: 5,
  premium: 5,
  event: 5,
  marketplace: 5,
};

const MAX_POINTS = 100;
const API_BASE = import.meta.env.VITE_THUNDLE_API ?? "";

/* ───────────── Component ───────────── */
export default function ClueGame() {
  const nav = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [points, setPoints] = useState(MAX_POINTS);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [revealed, setRevealed] = useState<Record<ClueKey, boolean>>({
    name: false,
    image: false,
    country: false,
    type: false,
    tier: false,
    br: false,
    premium: false,
    event: false,
    marketplace: false,
  });

  /* Fetch a random vehicle on mount */
  useEffect(() => {
    async function fetchVehicle() {
      try {
        // same endpoint you used in the blur game
        const { data } = await axios.get<Vehicle>(`${API_BASE}/random`, {
          params: { mode: "ground" },
        });
        setVehicle(data);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load vehicle.");
      }
    }
    fetchVehicle();
  }, []);

  /* Reveal a clue */
  const reveal = (key: ClueKey) => {
    if (revealed[key]) return;
    setRevealed({ ...revealed, [key]: true });
    setPoints((p) => Math.max(0, p - CLUE_COST[key]));
  };

  /* Handle guesses */
  const handleGuess = () => {
    if (!vehicle) return;

    if (guess.trim().toLowerCase() === vehicle.name.toLowerCase()) {
      setMessage(`Correct! You scored ${points} points.`);
    } else {
      setMessage("Wrong guess, try again.");
    }
    setGuess("");
  };

  const maskedName = (name: string) =>
  name
    .split("")
    .map((ch, i) => (i % 2 === 0 ? ch : "_"))
    .join("");

  /* Boolean display helper */
  const yesNo = (flag?: boolean) => (flag ? "Yes" : "No");

  return (
    <div className="clue-game-container">
      {/* Home btn */}
      <button className="return-button" onClick={() => nav("/")}>
        ← Home
      </button>

      {/* Guess bar */}
      <div className="guess-bar">
        <input
          className="guess-input"
          placeholder="Guess..."
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGuess()}
        />
        <button className="guess-submit" onClick={handleGuess}>
          →
        </button>
      </div>

      {/* Points bar */}
      <div className="points-wrapper">
        <div
          className="points-bar"
          style={{ width: `${(points / MAX_POINTS) * 100}%` }}
        />
        <span className="points-label">{points}</span>
      </div>

      {/* Grid */}
      <div className="clue-grid">
        {/* NAME */}
        <div
            className={`clue-card name-card ${revealed.name ? "revealed" : ""}`}
            onClick={() => reveal("name")}
            title={!revealed.name ? `- ${CLUE_COST.name} pts` : ""}
        >
            <span className="clue-label">Name</span>
            {revealed.name && vehicle && maskedName(vehicle.name)}
        </div>

        {/* IMAGE */}
        <div
          className={`clue-card image-card ${revealed.image ? "revealed" : ""}`}
          onClick={() => reveal("image")}
          title={!revealed.image ? "- Y pts" : ""}
        >
          <span className="clue-label">Image</span>
          {revealed.image && vehicle && (
            <img src={vehicle.image_url} alt="vehicle" />
          )}
        </div>

        {/* COUNTRY / TYPE / TIER / BR */}
        <div
          className={`clue-card country-card ${
            revealed.country ? "revealed" : ""
          }`}
          onClick={() => reveal("country")}
          title={!revealed.country ? "- Y pts" : ""}
        >
          <span className="clue-label">Country</span>
          {revealed.country && vehicle?.country}
        </div>
        <div
          className={`clue-card type-card ${revealed.type ? "revealed" : ""}`}
          onClick={() => reveal("type")}
          title={!revealed.type ? "- Y pts" : ""}
        >
          <span className="clue-label">Type</span>
          {revealed.type && vehicle?.vehicle_type}
        </div>
        <div
          className={`clue-card tier-card ${revealed.tier ? "revealed" : ""}`}
          onClick={() => reveal("tier")}
          title={!revealed.tier ? "- Y pts" : ""}
        >
          <span className="clue-label">Tier</span>
          {revealed.tier && vehicle?.tier}
        </div>
        <div
          className={`clue-card br-card ${revealed.br ? "revealed" : ""}`}
          onClick={() => reveal("br")}
          title={!revealed.br ? "- Y pts" : ""}
        >
          <span className="clue-label">Battle Rating</span>
          {revealed.br && vehicle?.realistic_br}
        </div>

        {/* BOOLEAN FLAGS */}
        <div
          className={`clue-card premium-card ${
            revealed.premium ? "revealed" : ""
          }`}
          onClick={() => reveal("premium")}
          title={!revealed.premium ? "- Y pts" : ""}
        >
          <span className="clue-label">Premium?</span>
          {revealed.premium && yesNo(vehicle?.is_premium)}
        </div>
        <div
          className={`clue-card event-card ${
            revealed.event ? "revealed" : ""
          }`}
          onClick={() => reveal("event")}
          title={!revealed.event ? "- Y pts" : ""}
        >
          <span className="clue-label">Event?</span>
          {revealed.event && yesNo(vehicle?.is_event)}
        </div>
        <div
          className={`clue-card marketplace-card ${
            revealed.marketplace ? "revealed" : ""
          }`}
          onClick={() => reveal("marketplace")}
          title={!revealed.marketplace ? "- Y pts" : ""}
        >
          <span className="clue-label">Marketplace?</span>
          {revealed.marketplace && yesNo(vehicle?.is_marketplace)}
        </div>
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  );
}
