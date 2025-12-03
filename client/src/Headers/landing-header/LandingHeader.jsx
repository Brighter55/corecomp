import styles from "./LandingHeader.module.css"
import Button from '@mui/material/Button';
import Brand from "./components/brand/Brand.jsx"
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from "react";


function LandingHeader() {
    const navigate = useNavigate();
    const [showNavBar, setShowNavBar] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        window.addEventListener("scroll", controlNavBar);
        console.log("render by useEffect");

        return () => {
            window.removeEventListener("scroll", controlNavBar);
        };
    }, []);

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

    return (
        <header className={showNavBar ? styles.header : styles.hideHeader}>
            <nav className={styles.nav}>
                <Brand />
                <div className={styles.about}>
                    <Button sx={{ "&:hover": {backgroundColor: "hsl(0, 0%, 100%, 0.125)"}, borderRadius: "10px", color: "grey"}} ><a href="/#features" className={styles.sectionAnchor}>features</a></Button>
                    <Button sx={{ "&:hover": {backgroundColor: "hsl(0, 0%, 100%, 0.125)"}, borderRadius: "10px", color: "grey"}} ><a href="/#pricing" className={styles.sectionAnchor}>pricing</a></Button>
                </div>
                <div className={styles.rightNav}>
                    <Button
                    onClick={() => {navigate("/sign-in")}}
                    sx={{   "&:hover": {backgroundColor: "hsl(0, 0%, 100%, 0.125)"},
                            borderRadius: "10px",
                            color: "grey"}}
                    >Sign in</Button>
                    <Button
                        onClick={() => {navigate("/sign-up")}}
                        sx={{
                            color: "black",
                            fontFamily: "'Segoe Ui', Arial, sans-serif",
                            borderRadius: "10px",
                            "&:hover": {backgroundColor: "lightgrey"},
                            backgroundColor: "#DAD7CD",
                        }}>Sign Up</Button>
                </div>
            </nav>
        </header>
    );
}

export default LandingHeader;
