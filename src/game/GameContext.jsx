import { createContext, useContext, useState } from "react";
import { PHASES, TURN } from "./phases";

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [phase, setPhase] = useState(PHASES.TITLE);
  const [turn, setTurn] = useState(TURN.PLAYER);

  const [friendlyUnits, setFriendlyUnits] = useState([]);
  const [enemyUnits, setEnemyUnits] = useState([]);

  return (
    <GameContext.Provider
      value={{
        phase,
        setPhase,
        turn,
        setTurn,
        friendlyUnits,
        setFriendlyUnits,
        enemyUnits,
        setEnemyUnits
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
