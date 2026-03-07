// borrows from overview page
import TimeRanges from "./TimeRanges.jsx"
import Explanation from "./Explanation.jsx"
// mui components
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';


function GraphTitle({ title, explanation, percentChange, timeRange, setTimeRange }) {

    return (
        <Stack direction="row" sx={{ alignItems: "center" }}>
            <Stack
                direction="row"
                sx={{ alignItems: "center", flexGrow: 1, justifyContent: "center" }}
                spacing={1}
            >
                <Typography variant="h6" textAlign="center">{title}</Typography>
                <Explanation explanation={explanation} />
            </Stack>
            <Typography
                variant="h6"
                sx={{
                    color: (percentChange === null || isNaN(percentChange)) ? "#666" : (percentChange >= 0 ? "#3A5A40" : "#bc4749"),
                }}
            >
                {(percentChange === null || isNaN(percentChange)) ? "N/A" : (percentChange >= 0 ? `+${percentChange}%` : `${percentChange}%`)}
            </Typography>
            <TimeRanges timeRange={timeRange} setTimeRange={setTimeRange} />
        </Stack>
    )
}



export default GraphTitle
