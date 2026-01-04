import Enemy from "./Enemy";
import PartyMember from "./PartyMember";

export default function BattleScene() {
    return (
        <div className="battlefield">
            <div className="arena" data-arena="forest">

                <div className="enemies">
                    <Enemy
                        icon="/Icons/linkedinpixel.png"
                        link="https://www.linkedin.com/in/daniel-mardunovich/"
                        className="LinkedIn"
                    />
                    <Enemy
                        icon="/Icons/Self.png"
                        link="https://danielmardunovich.github.io/Portfolio/"
                        className="Self"
                    />
                    <Enemy
                        icon="/Icons/githubpixel.png"
                        link="https://github.com/DanielMardunovich"
                        className="GitHub"
                    />
                </div>

                <div className="party">
                    <PartyMember
                        icon="/GameLogos/BulletDance.png"
                        link="https://mattias0004.itch.io/bullet-dance"
                    />
                    <PartyMember
                        icon="/GameLogos/Cosmosis.png"
                        link="https://futuregames.itch.io/cosmosis"
                    />
                    <PartyMember
                        icon="/GameLogos/Thrall.png"
                        link="https://develop-thrall-gp3.vercel.app"
                    />
                </div>

            </div>
        </div>
    );
}
