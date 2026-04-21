import { useEffect, useState } from "react";

function HideOnScroll(props) {
    const { children } = props;

    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined") {
            return undefined;
        }

        let previousScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollingDown = currentScrollY > previousScrollY;
            const beyondThreshold = currentScrollY > 80;

            setIsVisible(!(scrollingDown && beyondThreshold));
            previousScrollY = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div
            className={`transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
        >
            {children}
        </div>
    );
}


export default HideOnScroll
