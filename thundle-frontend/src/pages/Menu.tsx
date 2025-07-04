import { useNavigate } from "react-router-dom";
import './Menu.css';

export default function Menu() {
  const navigate = useNavigate();

  return (
    <div className="menu-container">
      <h1 className="menu-title">Welcome to Thundle!</h1>
      <div className="menu-buttons">
        <button
          onClick={() => navigate("/blur-game")}
          className="menu-button"
        >
          Blurdle
        </button>
        <button
          onClick={() => navigate("/clue-game")}
          className="menu-button"
        >
          Cluedle
        </button>
      </div>
    </div>
  );
}
