import { useNavigate } from "react-router-dom";

export default function Menu() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white gap-4">
      <h1 className="text-4xl font-bold mb-8">Welcome to Thundle!</h1>
      <button
        onClick={() => navigate("/blur-game")}
        className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700 text-xl"
      >
        Blurdle
      </button>
      <button
        onClick={() => navigate("/clue-game")}
        className="bg-green-600 px-6 py-3 rounded hover:bg-green-700 text-xl"
      >
        Cluedle
      </button>
    </div>
  );
}