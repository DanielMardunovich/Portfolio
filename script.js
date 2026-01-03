document.addEventListener("DOMContentLoaded", () => {

    const enemies = document.querySelectorAll(".enemy");

    enemies.forEach(enemy => {
        enemy.addEventListener("click", event => {

            // If it's a link, prevent instant navigation
            event.preventDefault();

            // Prevent double click
            if (enemy.classList.contains("defeated")) return;

            enemy.classList.add("defeated");

            // Optional: screen shake
            const battlefield = document.querySelector(".battlefield");
            battlefield?.classList.add("shake");

            setTimeout(() => {
                battlefield?.classList.remove("shake");
            }, 200);

            // Open link AFTER animation
            const url = enemy.getAttribute("href");
            if (url) {
                setTimeout(() => {
                    window.open(url, "_blank");
                    enemy.classList.remove("defeated");
                }, 600);
            }
        });
    });

});
