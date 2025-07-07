// src/pages/ArchiveMenu.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function ArchiveMenu({ game }: { game: "blur" | "clue" }) {
  const { mode = "all" } = useParams<"mode">();
  const [dates, setDates] = useState<string[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    axios
      .get<string[]>(`/cached_dates`, { params: { game } })
      .then((r) => setDates(r.data ?? []))
      .catch(() => setDates([]));
  }, [game]);

  return (
    <div className="archive-menu">
      <h2>{game === "blur" ? "Blurdle" : "Cluedle"} Archive ({mode})</h2>
      {dates.map((d) => (
        <button
          key={d}
          onClick={() => nav(`/${game}-archive/${mode}/${d}`)}
        >
          {d.replaceAll("_", "/")}
        </button>
      ))}
      <button onClick={() => nav("/")}>← Back</button>
    </div>
  );
}
