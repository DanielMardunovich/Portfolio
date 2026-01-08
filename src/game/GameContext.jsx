import { createContext, useContext, useState } from "react";
import { PHASES } from "./phases";

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [phase, setPhase] = useState(PHASES.TITLE);

  return (
    <GameContext.Provider value={{ phase, setPhase }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
