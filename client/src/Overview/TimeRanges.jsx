import React, { useState, useEffect, useRef } from 'react';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';

function TimeRanges({ className, timeRange, setTimeRange }) {

    function handleOptionClicked(event) {
        setTimeRange(event.target.value);
    }

    const menuItemStyle = {
        color: "#344E41",
        fontFamily: "'Segoe Ui', Arial, sans-serif",
    }

    return (
        <FormControl sx={{ m: 1, width: 80 }}>
            <Select
            value={timeRange}
            onChange={handleOptionClicked}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
            sx={{ color: "#344E41",
                fontFamily: "'Segoe Ui', Arial, sans-serif",
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: "#A3B18A",
                },
             }}
            >
                <MenuItem value="YTD" sx={menuItemStyle}>YTD</MenuItem>
                <MenuItem value="1Y" sx={menuItemStyle}>1Y</MenuItem>
                <MenuItem value="5Y" sx={menuItemStyle}>5Y</MenuItem>
                <MenuItem value="10Y" sx={menuItemStyle}>10Y</MenuItem>
                <MenuItem value="all" sx={menuItemStyle}>all</MenuItem>
            </Select>
      </FormControl>
    );
}


export default TimeRanges
