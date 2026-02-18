import { createContext, useContext, useState, useRef, useEffect, useMemo } from "react";
import { PHASES, TURN } from "./phases";

const GameContext = createContext(null);

// Wrap a setter to trace calls when invoked during render
function makeTracingSetter(setter, name, renderingRef) {
  return (...args) => {
    if (renderingRef.current) {
      console.warn(`Context setter '${name}' called while GameProvider is rendering — deferring to next tick.`);
      console.trace();
      // Defer to allow current render to finish. This avoids React's "setState in render" error.
      return setTimeout(() => setter(...args), 0);
    }
    return setter(...args);
  };
}

export function GameProvider({ children }) {
  // A ref that is true during the render phase of this provider and cleared
  // in a post-render effect. This helps detect setters called synchronously
  // during render of children.
  const renderingRef = useRef(true);

  const [phase, setPhase] = useState(PHASES.TITLE);
  const [turn, setTurn] = useState(TURN.PLAYER);

  const [friendlyUnits, setFriendlyUnits] = useState([]);
  const [enemyUnits, setEnemyUnits] = useState([]);

  useEffect(() => {
    // Clear the rendering flag after the first commit for this render pass
    renderingRef.current = false;
    return () => {
      // Ensure flag is reset for next render
      renderingRef.current = false;
    };
  });

  // Provide wrapped setters that will log a stack trace if they're invoked
  // while the provider is in its render phase. This is diagnostic only and
  // can be removed once the offending callsite is found.
  const value = useMemo(() => ({
    phase,
    setPhase: makeTracingSetter(setPhase, 'setPhase', renderingRef),
    turn,
    setTurn: makeTracingSetter(setTurn, 'setTurn', renderingRef),
    friendlyUnits,
    setFriendlyUnits: makeTracingSetter(setFriendlyUnits, 'setFriendlyUnits', renderingRef),
    enemyUnits,
    setEnemyUnits: makeTracingSetter(setEnemyUnits, 'setEnemyUnits', renderingRef)
  }), [phase, turn, friendlyUnits, enemyUnits]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
