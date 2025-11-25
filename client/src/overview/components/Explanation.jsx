import Tooltip from '@mui/material/Tooltip';
import HelpIcon from '@mui/icons-material/Help';

function Explanation({ explanation, maxWidth }) {
    // if maxWidth is not set, set it to 500 (default)
    if (maxWidth == null) {
        maxWidth = 500;
    }

    return (
        <Tooltip
            disableFocusListener
            disableTouchListener
            title={explanation}
            slotProps={{ tooltip: { sx: {maxWidth: maxWidth, padding: "20px"} } }}
        >
            <HelpIcon />
        </Tooltip>
    )
}


export default Explanation
