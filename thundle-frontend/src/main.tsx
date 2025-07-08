import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Menu from "./pages/Menu";
import ArchiveMenu from "./pages/ArchiveMenu";
import BlurGame from "./pages/BlurGame";
import ClueGame from "./pages/ClueGame";
import ApiKeepAlive from "./components/ApiKeepAlive";
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApiKeepAlive>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/blur-game/:mode" element={<BlurGame />} />
          <Route path="/clue-game/:mode" element={<ClueGame />} />
          <Route path="/blur-archive"             element={<ArchiveMenu game = "blur" />} />
          <Route path="/blur-archive/:mode/:date"       element={<BlurGame />} />
          <Route path="/clue-archive"             element={<ArchiveMenu game = "clue" />} />
          <Route path="/clue-archive/:mode/:date"       element={<ClueGame />} />
        </Routes>
      </BrowserRouter>
    </ApiKeepAlive>
  </React.StrictMode>
);
