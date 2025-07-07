// src/pages/ArchiveMenu.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Menu.css"
import axios from "axios";

/* ───────────── Config ───────────── */
const API_BASE = import.meta.env.VITE_THUNDLE_API ?? "";

export default function ArchiveMenu({ game }: { game: "blur" | "clue" }) {
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    axios.get<string[]>(`${API_BASE}/cached_dates`, {
      params: { game: game }
    }).then(res => {
      setDates(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="menu-container">
      <h1 className="menu-title">{game === "blur" ? "Blurdle" : "Cluedle"} Archive</h1>
      {loading && <p>Loading...</p>}
      <div className="menu-buttons">
        {dates.map((d) => (
            <button
                key={d}
                onClick={() => nav(`/${game}-archive/all/${d}`)}
                className="menu-button"
            >
                {d.replaceAll("_", "/")}
            </button>
        ))}
        <button 
            onClick={() => nav("/")}
            className="menu-button"
        >
            ← Back
        </button>
      </div>
    </div>
  );
}