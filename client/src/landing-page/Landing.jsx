import LandingHeader from "../headers/landing-header/LandingHeader.jsx"
import {useNavigate} from "react-router-dom"
import { useState } from "react"
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Grow from '@mui/material/Grow';
import placeholderImage from "../assets/placeholderImage.png"
import styles from "./Landing.module.css"

function Landing() {
    const navigate = useNavigate();


    const [cards, setCards] = useState([
        { id: 0, text: "Over 20 years of comprehensive financial data that provides a broad view of any company.", image: placeholderImage },
        { id: 1, text: "10+  fundamentals to help you truly understand a company’s performance", image: placeholderImage },
        { id: 2, text: "Beginners? Professionals? CoreComp explains everything in simple terms!", image: placeholderImage },
    ]);
    const [currentPage, setCurrentPage] = useState(0);
    const [slideDirection, setSlideDirection] = useState("left");

    function handleNextPage() {
        setSlideDirection("left");
        setCurrentPage((currentPage) => currentPage + 1);
    }

    function handlePrevPage() {
        setSlideDirection("right");
        setCurrentPage((currentPage) => currentPage - 1);
    }


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
                    <Fab variant="extended" onClick={handleTryClicked} sx={{ width: "20%", backgroundColor: "#DAD7CD", textTransform: 'none', "&:hover": {backgroundColor: "#588157"} }}>Get Started</Fab>
                </div>
            </section>
            <section id="features" className={styles.features}>
                <div className={styles.featureContainer}>
                    <IconButton
                        onClick={handlePrevPage}
                        sx={{ margin: 5 }}
                        disabled={currentPage === 0}
                    >
                        <NavigateBeforeIcon />
                    </IconButton>
                    {cards.map((card, index) => (
                            <div className={styles.feature} style={{ display: currentPage === index ? "flex" : "none" }}>
                                <h1 style={{ textAlign: "left", width: "100%" }}>{card.text}</h1>
                                <Grow
                                in={currentPage === index}
                                timeout={500}
                                >
                                    <img
                                        key={index}
                                        src={card.image}
                                        style={{
                                            width: "80%",
                                            height: "80%",
                                        }}
                                    />
                                </Grow>
                            </div>

                    ))}
                    <IconButton
                        onClick={handleNextPage}
                        sx={{
                        margin: 5,
                        }}
                        disabled={
                        currentPage >= Math.ceil(cards.length || 0) - 1
                        }
                    >
                        <NavigateNextIcon />
                    </IconButton>
                </div>
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
