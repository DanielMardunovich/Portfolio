import { useGame } from "../game/GameContext";
import { PHASES, TURN } from "../game/phases";
import "../styles/turnIndicator.css";

export default function TurnIndicator() {
  const { phase, turn } = useGame();

  if (phase === PHASES.TITLE) return null;

  const label = turn === TURN.ENEMY ? "Enemy Turn" : "Player Turn";

  return (
    <div className={`turn-indicator ${turn}`} aria-live="polite">
      {label}
    </div>
  );
}
