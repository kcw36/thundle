import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Menu from "./pages/Menu";
import BlurGame from "./pages/BlurGame";
import ClueGame from "./pages/ClueGame";
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/blur-game" element={<BlurGame />} />
        <Route path="/clue-game" element={<ClueGame />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
