import PartyMember from "./PartyMember";

export default function Party() {
    return (
        <div className="party">
            <PartyMember
                icon="/GameLogos/BulletDance.png"
                link="https://mattias0004.itch.io/bullet-dance"
                alt="Bullet Dance"
            />

            <PartyMember
                icon="/GameLogos/Cosmosis.png"
                link="https://futuregames.itch.io/cosmosis"
                alt="Cosmosis"
            />

            <PartyMember
                icon="/GameLogos/Thrall.png"
                link="https://develop-thrall-gp3.vercel.app"
                alt="Thrall"
            />
        </div>
    );
}
