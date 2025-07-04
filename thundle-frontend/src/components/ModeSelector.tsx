// src/components/ModeSelector.tsx
import { useNavigate, useParams } from "react-router-dom";
import "./ModeSelector.css"; // tiny flex row

const modes = ["all", "ground", "air", "naval", "helicopter"] as const;
type Mode = (typeof modes)[number];

export default function ModeSelector({ game }: { game: "blur-game" | "clue-game" }) {
  const navigate = useNavigate();
  const { mode = "all" } = useParams<"mode">();

  return (
    <div className="mode-selector">
      {modes.map((m) => (
        <button
          key={m}
          className={m === mode ? "active" : ""}
          onClick={() => {
            localStorage.setItem("thundle-mode", m);
            navigate(`/${game}/${m}`);
          }}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
