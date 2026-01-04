
import { useRef } from "react";
import useParallax from "./useParallax";

const ARENA_BACKGROUNDS = {
    Forest: "/BattleMaps/battleback1.png",
    Desert: "/BattleMaps/battleback3.png",
    Dungeon: "/BattleMaps/battleback8.png"
};

export default function Arena({ type = "forest", children }) {
    const arenaRef = useRef(null);
    useParallax(arenaRef, 0.4);

    return (
        <div
            ref={arenaRef}
            className="arena"
            style={{ backgroundImage: `url(${ARENA_BACKGROUNDS[type]})` }}
        >
            {children}
        </div>
    );
}
