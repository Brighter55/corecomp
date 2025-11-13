import React, { useState, useEffect, useRef } from 'react';
import styles from "./TimeRanges.module.css"
function TimeRanges({ className, timeRange, setTimeRange }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    function handleOptionClicked(event) {
        setTimeRange(event.currentTarget.value);
    }

    return (
        <div className={className} ref={dropdownRef}>
            <button onClick={toggleDropdown}>{timeRange}</button>
            {isOpen && (
            <div className={styles.options}>
                {/* Dropdown items go here */}
                <button value="YTD" onClick={handleOptionClicked}>YTD</button>
                <button value="1Y" onClick={handleOptionClicked}>1Y</button>
                <button value="5Y" onClick={handleOptionClicked}>5Y</button>
                <button value="10Y" onClick={handleOptionClicked}>10Y</button>
                <button value="all" onClick={handleOptionClicked}>all</button>
            </div>
            )}
        </div>
    );
}


export default TimeRanges
