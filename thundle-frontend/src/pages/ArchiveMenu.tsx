// src/pages/ArchiveMenu.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


/* ───────────── Config ───────────── */
const API_BASE     = import.meta.env.VITE_THUNDLE_API ?? "";
const CACHE_TTL_MS = 10 * 60 * 1000;

export default function ArchiveMenu({ game }: { game: "blur" | "clue" }) {
  const [dates, setDates]   = useState<string[]>([]);
  const [loading, setLoad]  = useState(true);
  const nav                 = useNavigate();

  useEffect(() => {
    const cacheKey = `${game}-archive-dates`;
    const cached   = localStorage.getItem(cacheKey);

    /* try cache */
    if (cached) {
      const { data, timestamp } = JSON.parse(cached) as {
        data: string[];
        timestamp: number;
      };
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        setDates(data);
        setLoad(false);
        return;     
      }
    }

    /* fetch from API if no fresh cache */
    axios
      .get<string[]>(`${API_BASE}/cached_dates`, { params: { game } })
      .then((res) => {
        setDates(res.data ?? []);
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ data: res.data ?? [], timestamp: Date.now() })
        );
      })
      .catch(() => setDates([]))
      .finally(() => setLoad(false));
  }, [game]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-white text-center w-full">
      <h1 className="text-4xl mb-8">
        {game === "blur" ? "Blurdle" : "Cluedle"} Archive
      </h1>

      {loading && <p>Loading…</p>}

      <div className="flex flex-col gap-4">
        {dates.map((d) => (
          <button
            key={d}
            onClick={() => nav(`/${game}-archive/all/${d}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg cursor-pointer transition-colors duration-300 hover:bg-blue-700"
          >
            {d.replaceAll("_", "/")}
          </button>
        ))}

        <button onClick={() => nav("/")} className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg cursor-pointer transition-colors duration-300 hover:bg-blue-700">
          ← Back
        </button>
      </div>
    </div>
  );
}
