import styles from "./ProductHeader.module.css"
import logo from "../../assets/logoDarkMode.png"
import Features from "./Features/Features.jsx"
import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';
import { useEffect, useState, useRef } from "React"

function ProductHeader() {
    const [showNavBar, setShowNavBar] = useState(true);
    const lastScrollY = useRef(0);
    // listen to scroll position if it is less than previous then hide the NavBar if not then show

    function controlNavBar() {
        /*window.scrollY increases as user scrolls down*/
        if (window.scrollY > lastScrollY.current) {
            setShowNavBar(false);
        } else {
            setShowNavBar(true);
        }
        console.log("rerender by setLastScrollY");
        lastScrollY.current = window.scrollY
    }

    useEffect(() => {
        window.addEventListener("scroll", controlNavBar);
        console.log("render by useEffect");

        return () => {
            window.removeEventListener("scroll", controlNavBar);
        };
    }, []);

    return (
        <header className={showNavBar ? styles.header : styles.hideHeader}>
            <nav className={styles.nav}>
                <div className={styles.brand}>
                    <img src={logo} alt="logo" className={styles.logo} />
                    <a href="/overview" className={styles.brandText}>CoreComp</a>
                </div>
                <Features></Features>
                <div className={styles.rightNav}>
                    <Button sx={{ "&:hover": {backgroundColor: "#dce0e8"}, borderRadius: "10px" }} ><SettingsIcon sx={{ color: "#47546b" }} /></Button>
                    <Button
                        sx={{
                            color: "#47546b",
                            fontFamily: "'Segoe Ui', Arial, sans-serif",
                            borderRadius: "10px",
                            "&:hover": {backgroundColor: "#dce0e8"},
                        }}>Log out</Button>
                </div>
            </nav>
        </header>
    );
}

export default ProductHeader;
