/* ─────────────────────────────────────────
   ClueGame.tsx  —  Daily + Archive support
   ───────────────────────────────────────── */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ModeSelector from "../components/ModeSelector";
import { usePersistentState } from "../hooks/usePersistentState";


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
export default function ClueGame() {
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
  }, [mode, date, ansKey, isArchive, vKey]);

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
  }, [mode, date, revKey, ptsKey, setRevealed, setPoints]);

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
    if (!answer || points <= 0) return; // Disable if no answer or points are 0
    const cleanGuess = guess.trim().toLowerCase();

    if (cleanGuess === answer) {
      setMessage(`Correct! You scored ${points} pts.`);
    } else {
      const newPoints = Math.max(0, points - 10);
      setPoints(newPoints);
      if (newPoints === 0) {
        setMessage(`Game Over! The correct answer was ${answer}.`);
      } else {
        setMessage("Wrong guess. Try again.");
      }
    }
    setGuess("");
  };

  /* ───── JSX ───── */
  return (
    <div className="relative w-full min-h-screen p-5 bg-background text-[#dfe7ff] font-sans">
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
          <div className="flex gap-2 mb-3">
            <button onClick={() => nav("/")} className="bg-[#24324f] border-none text-[#dfe7ff] px-3 py-1 rounded-md cursor-pointer hover:bg-[#2f4063]">
              ← Home
            </button>
            <input
              list="vehicle-options"
              value={guess}
              onChange={e => setGuess(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              className="flex-1 bg-[#1d273b] border-none rounded-md px-3 py-2 text-white"
              placeholder="Guess…"
            />
            <button className="bg-[#485b7d] border-none text-white px-3.5 rounded-md text-xl cursor-pointer hover:bg-[#58709b]" onClick={submit}>
              →
            </button>
          </div>

          {/* points */}
          <div className="relative h-4.5 bg-[#1d273b] rounded mb-3">
            <div
              className="h-full bg-[#1f45ff] transition-width duration-300 ease-in-out"
              style={{ width: `${points}%` }}
            />
            <span className="absolute right-1.5 top-0 text-sm">{points}</span>
          </div>

          {/* grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[120px] gap-3">
            {/* NAME */}
            <div
              className={`col-span-2 text-xl tracking-widest ${revealed.name ? "bg-[#2f5e39] cursor-default" : "bg-[#2b3549] cursor-pointer"} rounded-lg relative p-1 flex items-center justify-center text-center`}
              title={!revealed.name ? `-${CLUE_COST.name} pts` : ""}
              onClick={() => reveal("name")}
            >
              {revealed.name ? <span className="text-lg md:text-xl lg:text-3xl">{vehicle && masked(vehicle.name)}</span> : <span className="text-lg md:text-xl lg:text-3xl uppercase tracking-wider text-[#b9c5e1] text-wrap">Name</span>}
            </div>

            {/* IMAGE */}
            <div
              className={`col-span-2 row-span-2 order-last md:row-span-3 md:col-span-2 md:order-none ${revealed.image ? "bg-[#2f5e39] cursor-default" : "bg-[#2b3549] cursor-pointer"} rounded-lg relative p-1 flex items-center justify-center text-center`}
              title={!revealed.image ? `-${CLUE_COST.image} pts` : ""}
              onClick={() => reveal("image")}
            >
              {revealed.image ? vehicle && (
                <img src={vehicle.image_url} alt="vehicle" className="w-full h-full object-contain rounded-md" />
              ) : <span className="text-lg md:text-xl lg:text-3xl uppercase tracking-wider text-[#b9c5e1] text-wrap">Image</span>}
            </div>

            {/* COUNTRY / TYPE / TIER / BR */}
            <div
              className={`${revealed.country ? "bg-[#2f5e39] cursor-default" : "bg-[#2b3549] cursor-pointer"} rounded-lg relative p-1 flex items-center justify-center text-center`}
              title={!revealed.country ? `-${CLUE_COST.country} pts` : ""}
              onClick={() => reveal("country")}
            >
              {revealed.country ? <span className="text-lg md:text-xl lg:text-3xl">{vehicle?.country}</span> : <span className="text-lg md:text-xl lg:text-3xl uppercase tracking-wider text-[#b9c5e1] text-wrap">Country</span>}
            </div>
            <div
              className={`${revealed.type ? "bg-[#2f5e39] cursor-default" : "bg-[#2b3549] cursor-pointer"} rounded-lg relative p-1 flex items-center justify-center text-center`}
              title={!revealed.type ? `-${CLUE_COST.type} pts` : ""}
              onClick={() => reveal("type")}
            >
              {revealed.type ? <span className="text-lg md:text-xl lg:text-3xl">{vehicle?.vehicle_type}</span> : <span className="text-lg md:text-xl lg:text-3xl uppercase tracking-wider text-[#b9c5e1] text-wrap">Type</span>}
            </div>
            <div
              className={`${revealed.tier ? "bg-[#2f5e39] cursor-default" : "bg-[#2b3549] cursor-pointer"} rounded-lg relative p-1 flex items-center justify-center text-center`}
              title={!revealed.tier ? `-${CLUE_COST.tier} pts` : ""}
              onClick={() => reveal("tier")}
            >
              {revealed.tier ? <span className="text-lg md:text-xl lg:text-3xl">{vehicle?.tier}</span> : <span className="text-lg md:text-xl lg:text-3xl uppercase tracking-wider text-[#b9c5e1] text-wrap">Tier</span>}
            </div>
            <div
              className={`${revealed.br ? "bg-[#2f5e39] cursor-default" : "bg-[#2b3549] cursor-pointer"} rounded-lg relative p-1 flex items-center justify-center text-center`}
              title={!revealed.br ? `-${CLUE_COST.br} pts` : ""}
              onClick={() => reveal("br")}
            >
              {revealed.br ? <span className="text-lg md:text-xl lg:text-3xl">{vehicle?.realistic_br}</span> : <span className="text-lg md:text-xl lg:text-3xl uppercase tracking-wider text-[#b9c5e1] text-wrap">BR</span>}
            </div>

            {/* FLAGS */}
            {(["premium", "event", "marketplace", "squadron"] as const).map(k => (
              <div
                key={k}
                className={`${revealed[k] ? "bg-[#2f5e39] cursor-default" : "bg-[#2b3549] cursor-pointer"} rounded-lg relative p-1 flex items-center justify-center text-center`}
                title={!revealed[k] ? `-${CLUE_COST[k]} pts` : ""}
                onClick={() => reveal(k)}
              >
                {revealed[k] ? <span className="text-lg md:text-xl lg:text-3xl">{yesNo(vehicle && vehicle[`is_${k}`])}</span> : <span className="text-lg md:text-xl lg:text-3xl uppercase tracking-wider text-[#b9c5e1] text-wrap">{k === "marketplace" ? "Market" : k === "squadron" ? "Squad" : k.charAt(0).toUpperCase() + k.slice(1)}</span>}
              </div>
            ))}
          </div>

          {message && <p className="message text-center pt-4 text-lg md:text-xl lg:text-3xl">{message}</p>}
        </>
      )}
    </div>
  );
}
