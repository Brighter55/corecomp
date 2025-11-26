import LandingHeader from "../headers/landing-header/LandingHeader.jsx"
import {useNavigate} from "react-router-dom"
import Button from '@mui/material/Button';
import styles from "./Landing.module.css"

function Landing() {
    const navigate = useNavigate();

    function handleTryClicked(event) {
        event.preventDefault();
        navigate("/sign-up");
    }

    return (
        <>
            <LandingHeader />
            <section id="hero" className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 style={{ fontSize: "60px", textAlign: "center", fontFamily: "Montserrat" }}>An “every Core detail of a Company” app</h1>
                    <hr style={{ width: "30%" }}/>
                    <p style={{ fontSize: "1.2rem", textAlign: "center" }}>Turns complex financial data into simple, easy-looking graphs with over 20+ years of financial data and clear, beginner-friendly explanations.</p>
                    <Button variant="contained" onClick={handleTryClicked} sx={{ width: "20%", backgroundColor: "#588157", textTransform: 'none' }}>Get Started</Button>
                </div>
            </section>
            <section id="features">
                <h2>TO DO features</h2>
            </section>
            <section id="pricing">
                <h2>TO DO demo</h2>
            </section>
            <footer>
                <h2>TO DO footer</h2>
            </footer>
        </>
    )
}

export default Landing
