import styles from "./ProductHeader.module.css"
import logo from "../../assets/logoDarkMode.png"
import Features from "./Features/Features.jsx"
import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from "React"
import { getNewTokens } from "../../helpers/helper.js"

function ProductHeader() {
    const [showNavBar, setShowNavBar] = useState(true);
    const lastScrollY = useRef(0);
    const navigate = useNavigate();

    useEffect(() => {
        window.addEventListener("scroll", controlNavBar);
        console.log("render by useEffect");

        return () => {
            window.removeEventListener("scroll", controlNavBar);
        };
    }, []);

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

    function handleSettingClicked() {
        navigate("/user-account");
    }

    async function handleSignoutClicked() {
        // send a request to Django with refresh token to revoke the token
        async function signOut() {
            const response = await fetch("http://127.0.0.1:8000/api/sign-out", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${sessionStorage.getItem("access")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({refresh: sessionStorage.getItem("refresh")}),
            });
            return response;
        }
        let response = await signOut();
        let data = await response.json();

        /*get new tokens if access expires*/
        if (!response.ok) {
            if (data?.messages?.[0]?.message === "Token is expired") {
                await getNewTokens(data, navigate);
                response = await signOut();
                data = await response.json();
            } else if (response.status === 403) { /*Unauthorized user, aka, don't have permission to use*/
                navigate("/user-account");
            } else {
                navigate("/sign-up");
            }
        }
        /*--------------*/
        console.log(data.success);
        sessionStorage.removeItem("access");
        sessionStorage.removeItem("refresh");
        navigate("/sign-in");
    }

    return (
        <header className={showNavBar ? styles.header : styles.hideHeader}>
            <nav className={styles.nav}>
                <div className={styles.brand}>
                    <img src={logo} alt="logo" className={styles.logo} />
                    <a href="/overview" className={styles.brandText}>CoreComp</a>
                </div>
                <Features></Features>
                <div className={styles.rightNav}>
                    <Button onClick={handleSettingClicked} sx={{ "&:hover": {backgroundColor: "hsl(0, 0%, 100%, 0.125)"}, borderRadius: "10px" }} ><SettingsIcon sx={{ color: "grey" }} /></Button>
                    <Button
                        onClick={handleSignoutClicked}
                        sx={{
                            color: "black",
                            fontFamily: "'Segoe Ui', Arial, sans-serif",
                            borderRadius: "10px",
                            "&:hover": {backgroundColor: "#cbcfd6"},
                            backgroundColor: "#dce0e8",
                        }}>Sign Out</Button>
                </div>
            </nav>
        </header>
    );
}

export default ProductHeader;
