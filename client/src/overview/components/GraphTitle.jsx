// borrows from overview page
import TimeRanges from "./TimeRanges.jsx"
import Explanation from "./Explanation.jsx"
// mui components
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';


function GraphTitle({title, explanation, percentChange, timeRange, setTimeRange, menuContainer}) {

    return (
        <Stack direction="row" sx={{ alignItems: "center" }}>
            <Stack
                direction="row"
                sx={{ alignItems: "center", flexGrow: 1, justifyContent: "center" }}
                spacing={1}
            >
                <Typography sx={{ typography: {xs: "h6", sm: "h5"} }}>{title}</Typography>
                <Explanation explanation={explanation} />
            </Stack>
            <Typography
                sx={{
                    color: percentChange >= 0 ? "#3A5A40" : "#bc4749",
                    typography: {xs: "h6", sm: "h5"},
                }}
            >
                {percentChange >= 0 ? `+${percentChange}%` : `${percentChange}%`}
            </Typography>
            <TimeRanges timeRange={timeRange} setTimeRange={setTimeRange} menuContainer={menuContainer} />
        </Stack>
    )
}



export default GraphTitle
