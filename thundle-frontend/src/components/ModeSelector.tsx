// src/components/ModeSelector.tsx
import { useNavigate, useParams } from "react-router-dom";

const modes = ["all", "ground", "air", "naval", "helicopter"] as const;

export default function ModeSelector({ game }: { game: "blur-game" | "clue-game" | "blur-archive" | "clue-archive" }) {
  const navigate = useNavigate();
  const { mode = "all", date } = useParams<"mode" | "date">();

  return (
    <div className="flex gap-2 mb-3">
      {modes.map((m) => (
        <button
          key={m}
          className={`bg-[#24324f] text-[#dfe7ff] border-none px-2 py-1 rounded cursor-pointer hover:bg-accent ${m === mode ? "bg-accent" : ""}`}
          onClick={() => {
            localStorage.setItem("thundle-mode", m);
            const path = `/${game}/${m}${date ? `/${date}` : ""}`;
            navigate(path);
          }}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
