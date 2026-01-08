import { GameProvider } from "./game/GameContext";
import BattleMap from "./map/BattleMap";
import TitleOverlay from "./ui/TitleOverlay";

export default function App() {
  return (
    <GameProvider>
      <BattleMap />
      <TitleOverlay />
    </GameProvider>
  );
}
