import { useNavigate } from "react-router-dom";
import "./ClueGame.css"

function ClueGame() {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            <h1 className="text-3xl font-bold">Clue Game</h1>
            <p className="mt-4 text-lg">This game is coming soon!</p>
            <button
                onClick={() => navigate("/")}
                className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700 transition"
            >
                ← Return to Home
            </button>
        </div>
    );
};

export default ClueGame;