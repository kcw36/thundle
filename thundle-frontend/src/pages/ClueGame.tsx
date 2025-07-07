/* ─────────────────────────────────────────
   ClueGame.tsx  —  Daily + Archive support
   ───────────────────────────────────────── */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ModeSelector from "../components/ModeSelector";
import { usePersistentState } from "../hooks/usePersistentState";
import "./ClueGame.css";

/* ───── Types ───── */
export interface Vehicle {
  _id: string;
  country: string;
  vehicle_type: string;
  tier: number;
  realistic_br: number;
  realistic_ground_br: number;
  is_event: boolean;
  is_premium: boolean;
  is_marketplace: boolean;
  is_squadron: boolean;
  image_url: string;
  name: string;
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

/* ───── Config ───── */
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

const API_BASE = import.meta.env.VITE_THUNDLE_API ?? "";
const berlinDate = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Berlin" });

/* ───── Component ───── */
export default function ClueGame({ archive = false }: { archive?: boolean } = {}) {
  const nav = useNavigate();
  const { mode = "all", date } = useParams<"mode" | "date">();

  /* Archive? */
  const isArchive = Boolean(date);
  const today     = berlinDate();
  const gameDate  = isArchive ? (date as string) : today;

  /* storage keys (per mode + date) */
  const vKey   = `clue-${mode}-vehicle-${gameDate}`;
  const ansKey = `clue-${mode}-answer-${gameDate}`;
  const ptsKey = `clue-${mode}-points-${gameDate}`;
  const revKey = `clue-${mode}-revealed-${gameDate}`;

  /* state */
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [answer, setAnswer]   = useState("");
  const [points, setPoints]   = usePersistentState(ptsKey, 100);
  const [revealed, setRevealed] = usePersistentState<Record<ClueKey, boolean>>(
    revKey,
    DEFAULT_REVEALED
  );
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [names, setNames] = useState<VehicleOption[]>([]);

  /* fetch vehicle */
  useEffect(() => {
    async function loadVehicle() {
      setLoading(true);
      const cached = localStorage.getItem(vKey);
      if (cached) {
        const v = JSON.parse(cached) as Vehicle;
        setVehicle(v);
        setAnswer(v.name.toLowerCase());
        setLoading(false);
        return;
      }
      try {
        if (isArchive) {
          const { data } = await axios.get<Vehicle[]>(`${API_BASE}/historic`, {
            params: { date, game: "clue", mode },
          });
          if (data?.length) {
            const v = data[0];
            setVehicle(v);
            setAnswer(v.name.toLowerCase());
            localStorage.setItem(vKey, JSON.stringify(v));
            localStorage.setItem(ansKey, v.name.toLowerCase());
          }
        } else {
          const { data } = await axios.get<Vehicle>(`${API_BASE}/random`, {
            params: { mode },
          });
          setVehicle(data);
          setAnswer(data.name.toLowerCase());
          localStorage.setItem(vKey, JSON.stringify(data));
          localStorage.setItem(ansKey, data.name.toLowerCase());
        }
      } catch (err) {
        setMessage("Failed to load vehicle.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadVehicle();
  }, [mode, date]);

  /* autocomplete names */
  useEffect(() => {
    axios
      .get<VehicleOption[]>(`${API_BASE}/names`, { params: { mode } })
      .then(r => setNames(r.data))
      .catch(() => setNames([]));
  }, [mode]);

  /* reset progress if first time for this mode+date */
  useEffect(() => {
    if (!localStorage.getItem(revKey)) setRevealed(DEFAULT_REVEALED);
    if (!localStorage.getItem(ptsKey)) setPoints(100);
    setGuess("");
    setMessage("");
  }, [mode, date]);

  /* helpers */
  const masked = (n: string) =>
    n.split("").map((c, i) => (i % 2 ? "_" : c)).join("");
  const yesNo = (f?: boolean) => (f ? "Yes" : "No");

  /* reveal */
  const reveal = (k: ClueKey) => {
    if (revealed[k]) return;
    setRevealed({ ...revealed, [k]: true });
    setPoints(p => Math.max(0, p - CLUE_COST[k]));
  };

  /* guess */
  const submit = () => {
    if (!answer) return;
    if (guess.trim().toLowerCase() === answer) {
      setMessage(`Correct! You scored ${points} pts.`);
    } else {
      setMessage("Wrong guess. Try again.");
    }
    setGuess("");
  };

  /* ───── JSX ───── */
  return (
    <div className="clue-game-container">
      <ModeSelector game={isArchive ? "clue-archive" : "clue-game"} />

      {loading ? (
        <div className="flex justify-center items-center h-[300px]">
          <p className="text-gray-400">Loading vehicle…</p>
        </div>
      ) : (
        <>
          {/* datalist */}
          <datalist id="vehicle-options">
            {names.map(n => (
              <option key={n._id} value={n.name} />
            ))}
          </datalist>

          {/* guess bar */}
          <div className="guess-bar">
            <button onClick={() => nav("/")} className="guess-submit">
              ← Home
            </button>
            <input
              list="vehicle-options"
              value={guess}
              onChange={e => setGuess(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              className="guess-input"
              placeholder="Guess…"
            />
            <button className="guess-submit" onClick={submit}>
              →
            </button>
          </div>

          {/* points */}
          <div className="points-wrapper">
            <div
              className="points-bar"
              style={{ width: `${points}%` }}
            />
            <span className="points-label">{points}</span>
          </div>

          {/* grid */}
          <div className="clue-grid">
            {/* NAME */}
            <div
              className={`clue-card name-card ${revealed.name ? "revealed" : ""}`}
              title={!revealed.name ? `-${CLUE_COST.name} pts` : ""}
              onClick={() => reveal("name")}
            >
              <span className="clue-label">Name</span>
              {revealed.name && vehicle && masked(vehicle.name)}
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
            {(["premium", "event", "marketplace", "squadron"] as const).map(k => (
              <div
                key={k}
                className={`clue-card ${k}-card ${revealed[k] ? "revealed" : ""}`}
                title={!revealed[k] ? `-${CLUE_COST[k]} pts` : ""}
                onClick={() => reveal(k)}
              >
                <span className="clue-label">{k.charAt(0).toUpperCase() + k.slice(1)}?</span>
                {revealed[k] && yesNo((vehicle as any)[`is_${k}`])}
              </div>
            ))}
          </div>

          {message && <p className="message">{message}</p>}
        </>
      )}
    </div>
  );
}
