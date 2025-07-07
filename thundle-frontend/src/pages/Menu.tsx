import { useNavigate } from "react-router-dom";
import './Menu.css';

export default function Menu() {
  const navigate = useNavigate();

  return (
    <div className="menu-container">
      <h1 className="menu-title">Welcome to Thundle!</h1>
      <div className="menu-buttons">
        <button
          onClick={() => navigate("/blur-game/all")}
          className="menu-button"
        >
          Blurdle (Daily)
        </button>
        <button 
          onClick={() => navigate(`/blur-archive`)}
          className="menu-button"
        >
          Blurdle (Archive)
        </button>
        <button
          onClick={() => navigate("/clue-game/all")}
          className="menu-button"
        >
          Cluedle (Daily)
        </button>
        <button 
          onClick={() => navigate(`/clue-archive`)}
          className="menu-button"
        >
          Cluedle (Archive)
        </button>
      </div>
    </div>
  );
}
