import { GameProvider } from "./game/GameContext";
import BattleMap from "./map/BattleMap";
import TitleOverlay from "./ui/TitleOverlay";
import TurnIndicator from "./ui/TurnIndicator";

export default function App() {
  return (
    <GameProvider>
      <BattleMap />
      <TitleOverlay />
      <TurnIndicator />
    </GameProvider>
  );
}
