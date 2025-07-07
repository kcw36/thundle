// src/components/ModeSelector.tsx
import { useNavigate, useParams } from "react-router-dom";
import "./ModeSelector.css"; // tiny flex row

const modes = ["all", "ground", "air", "naval", "helicopter"] as const;

export default function ModeSelector({ game }: { game: "blur-game" | "clue-game" | "blur-archive" | "clue-archive" }) {
  const navigate = useNavigate();
  const { mode = "all", date } = useParams<"mode" | "date">();

  return (
    <div className="mode-selector">
      {modes.map((m) => (
        <button
          key={m}
          className={m === mode ? "active" : ""}
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
