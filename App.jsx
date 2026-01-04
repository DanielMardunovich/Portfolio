import BattleScene from "./BattleScene";

export default function App() {
    return (
        <div className="screen">
            <BattleScene />

            <div className="ui">
                <div className="ui-section">
                    <div className="ui-label">ENEMIES</div>
                    <div className="ui-box left">
                        <p>LinkedIn</p>
                        <p>Portfolio</p>
                        <p>GitHub</p>
                    </div>
                </div>

                <div className="ui-section">
                    <div className="ui-label">PARTY</div>
                    <div className="ui-box right">
                        <div className="stats">
                            <div className="row"><span>Bullet Dance</span><span>52 / 59</span></div>
                            <div className="row"><span>Cosmosis</span><span>40 / 60</span></div>
                            <div className="row"><span>Thrall</span><span>29 / 32</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
