import { useState } from "react";

export default function Enemy({ icon, link, className }) {
    const [defeated, setDefeated] = useState(false);

    function handleClick(event) {
        event.preventDefault();
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
            target="_blank"
            rel="noreferrer"
        >
            <div className="unit">
                <img src={icon} alt="" />
            </div>
        </a>
    );
}
