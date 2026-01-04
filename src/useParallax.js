import { useEffect } from "react";

export default function useParallax(ref, strength = 0.4) {
    useEffect(() => {
        function handleMouseMove(event) {
            const x = (event.clientX / window.innerWidth - 0.5) * 10;
            const y = (event.clientY / window.innerHeight - 0.5) * 10;

            if (ref.current) {
                ref.current.style.transform =
                    `translate(${x * strength}px, ${y * strength}px)`;
            }

            document.body.style.backgroundPosition =
                `calc(50% + ${x}px) calc(50% + ${y}px)`;
        }

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [ref, strength]);
}
