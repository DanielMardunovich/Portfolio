import { useState } from "react";

export default function Enemy({ icon, link, className }) {
    const [defeated, setDefeated] = useState(false);

    function handleClick(e) {
        e.preventDefault();
        if (defeated) return;

        setDefeated(true);

        setTimeout(() => {
            window.open(link, "_blank");
        }, 600);
    }

    return (
        <a
            href={link}
            onClick={handleClick}
            className={`enemy enemy-icon ${className} ${defeated ? "defeated" : ""}`}
        >
            <div className="unit">
                <img src={icon} alt="" />
            </div>
        </a>
    );
}
