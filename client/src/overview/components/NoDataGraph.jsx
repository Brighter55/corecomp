import { useState, useRef, useEffect } from "react";
import GraphCard from "./GraphCard.jsx";

function NoDataGraph() {
    const [graphClicked, setGraphClicked] = useState(false);
    const graphRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (graphRef.current && !graphRef.current.contains(event.target)) {
                setGraphClicked(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="flex-1">
            <GraphCard ref={graphRef} graphClicked={graphClicked}>
                <button
                    type="button"
                    onClick={() => {
                        setGraphClicked(true);
                    }}
                    className="flex h-full w-full cursor-pointer items-center justify-center text-lg font-semibold text-[var(--main-pine-teal)]"
                >
                    No data
                </button>
            </GraphCard>
        </div>
    );
}

export default NoDataGraph;
