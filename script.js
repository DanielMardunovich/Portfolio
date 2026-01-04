document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       Arena selection
       ========================= */
    const arenaImages = {
        forest: "./BattleMaps/battleback8.png",
        sky: "./BattleMaps/skyArena.png",
        dungeon: "./BattleMaps/battleback8.png"
    };

    const arena = document.querySelector(".arena");

    if (arena) {
        const type = arena.dataset.arena;
        if (arenaImages[type]) {
            arena.style.backgroundImage = `url("${arenaImages[type]}")`;
        }
    }

    /* =========================
       Enemy defeat animation
       ========================= */
    document.querySelectorAll(".enemy").forEach(enemy => {
        enemy.addEventListener("click", event => {
            event.preventDefault();

            if (enemy.classList.contains("defeated")) return;

            enemy.classList.add("defeated");

            setTimeout(() => {
                window.open(enemy.href, "_blank");
            }, 600);
        });
    });

    /* =========================
       Parallax effect
       ========================= */
    window.addEventListener("mousemove", event => {
        const x = (event.clientX / window.innerWidth  - 0.5) * 10;
        const y = (event.clientY / window.innerHeight - 0.5) * 10;

        document.body.style.backgroundPosition =
            `calc(50% + ${x}px) calc(50% + ${y}px)`;

        if (arena) {
            arena.style.transform =
                `translate(${x * 0.4}px, ${y * 0.4}px)`;
        }
    });

});
