import Tooltip from '@mui/material/Tooltip';
import HelpIcon from '@mui/icons-material/Help';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { useState } from "react"

function Explanation({ explanation, maxWidth }) {
    // if maxWidth is not set, set it to 500 (default)
    if (maxWidth == null) {
        maxWidth = 500;
    }

    const [open, setOpen] = useState(false);

    const handleTooltipClose = () => {
        setOpen(false);
    };

    const handleTooltipOpen = () => {
        setOpen(true);
    };

    return (
        <ClickAwayListener onClickAway={handleTooltipClose}>
            <Tooltip
                onClose={handleTooltipClose}
                open={open}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                title={explanation}
                slotProps={{
                    tooltip: { sx: {maxWidth: maxWidth, padding: "20px"} },
                    popper: {
                        disablePortal: true,
                    },
                }}
            >
                <HelpIcon onClick={handleTooltipOpen}/>
            </Tooltip>
        </ClickAwayListener>
    )
}


export default Explanation
