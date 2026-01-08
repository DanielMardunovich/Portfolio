import { useGame } from "../game/GameContext";
import { PHASES } from "../game/phases";
import "../styles/titleOverlay.css";

export default function TitleOverlay() {
  const { phase, setPhase } = useGame();

  if (phase !== PHASES.TITLE) return null;

  return (
    <div
      className="title-overlay"
      onClick={() => setPhase(PHASES.MAP_INTRO)}
    >
      <h1 className="title-name">Daniel Mardunovich</h1>
      <p className="continue-text">Click to continue</p>
    </div>
  );
}
