import { useState, useRef, useEffect } from "react"
import GraphCard from "./GraphCard.jsx"
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function NoDataGraph() {
    const [graphClicked, setGraphClicked] = useState(false);
    const graphRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (graphRef.current && !graphRef.current.contains(event.target)) {
                setGraphClicked(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <Box sx={{ flex: 1 }}>
            <GraphCard ref={graphRef} graphClicked={graphClicked}>
                <Box
                    onClick={() => {setGraphClicked(true);}}
                    sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                    }}
                >
                    <Typography variant="h6" sx={{ color: "var(--main-pine-teal)" }}>
                        No data
                    </Typography>
                </Box>
            </GraphCard>
        </Box>
    )
}

export default NoDataGraph
