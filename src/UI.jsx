import EnemyList from "./EnemyList";
import PartyStats from "./PartyStats";

export default function UI() {
    return (
        <div className="ui">
            <EnemyList />
            <PartyStats />
        </div>
    );
}
