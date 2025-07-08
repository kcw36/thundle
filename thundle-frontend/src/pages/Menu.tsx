import { useNavigate } from "react-router-dom";
import Countdown from "../components/Countdown";


export default function Menu() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-white text-center w-full">
      <h1 className="text-4xl mb-8">Welcome to Thundle!</h1>
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate("/blur-game/all")}
          className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg cursor-pointer transition-colors duration-300 hover:bg-blue-700"
        >
          Blurdle (Daily)
        </button>
        <button 
          onClick={() => navigate(`/blur-archive`)}
          className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg cursor-pointer transition-colors duration-300 hover:bg-blue-700"
        >
          Blurdle (Archive)
        </button>
        <button
          onClick={() => navigate("/clue-game/all")}
          className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg cursor-pointer transition-colors duration-300 hover:bg-blue-700"
        >
          Cluedle (Daily)
        </button>
        <button 
          onClick={() => navigate(`/clue-archive`)}
          className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg cursor-pointer transition-colors duration-300 hover:bg-blue-700"
        >
          Cluedle (Archive)
        </button>
      </div>
      <div className="mt-8">
        <Countdown />
      </div>
    </div>
  );
}
