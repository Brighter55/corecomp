import { forwardRef } from "react";

const GraphCard = forwardRef(function GraphCard(
    { graphClicked = false, className = "", children, ...rest },
    ref
) {
    const baseClasses =
        "flex flex-col rounded-[10px] border border-white/10 bg-[var(--bg-main)] text-[var(--main-pine-teal)] transition-[height] duration-500 ease-in-out shadow-[3px_3px_3px_3px_rgba(0,0,0,0.1)]";
    const clickedClasses =
        "fixed left-[5vw] top-[10vh] z-[3] h-[80vh] w-[90vw] overflow-auto no-scrollbar";
    const defaultClasses = "h-80 w-full min-w-[21rem] sm:h-[25rem]";

    const combinedClassName = [
        baseClasses,
        graphClicked ? clickedClasses : defaultClasses,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div ref={ref} className={combinedClassName} {...rest}>
            {children}
        </div>
    );
});

GraphCard.displayName = "GraphCard";

export default GraphCard;
