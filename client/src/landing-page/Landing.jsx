import LandingHeader from "../headers/LandingHeader.jsx"
import {useNavigate} from "react-router-dom"
import { useState } from "react"
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Grow from '@mui/material/Grow';
import explanationImage from "../assets/explanation.png"
import SampleIncomeGraph from "./components/sample-income-graph/SampleIncomeGraph.jsx"
import GraphsCarousel from "./components/graphs-carousel/GraphsCarousel"
import Brand from "../shared/Brand.jsx"
import FAQ from "./components/FAQ.jsx"
import Divider from '@mui/material/Divider';
import DoneIcon from '@mui/icons-material/Done';
import { styled } from '@mui/material/styles';
import Steps from "./components/steps/Steps.jsx"
import styles from "./Landing.module.css"



function Landing() {
    const navigate = useNavigate();


    const [features, setFeatures] = useState([
        { id: 0, text: "Over 20 years of comprehensive financial data that provides a broad view of any company.", content: <SampleIncomeGraph /> },
        { id: 1, text: "10+  fundamentals to help you truly understand a company’s performance", content: <GraphsCarousel/> },
        { id: 2, text: "Beginners? Professionals? CoreComp explains everything in simple terms!", content: <img src={explanationImage} className={styles.featureImage} /> },
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

    const StyledDoneIcon = styled(DoneIcon)({
        color: "#588157",
    });

    const StyledFab = styled(Fab)({
        backgroundColor: "#2f3037",
        color: "white",
        width: "100%",
        height: "10%",
        textTransform: 'none',
        fontSize: "17px",
        borderRadius: "5px",
        "&:hover": {
            backgroundColor: "#588157"
        },
    });

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
                        sx={{ margin: 5, color: "#DAD7CD" }}
                        disabled={currentPage === 0}
                    >
                        <NavigateBeforeIcon />
                    </IconButton>
                    {features.map((feature, index) => (
                            <div key={index} className={styles.feature} style={{ display: currentPage === index ? "flex" : "none" }}>
                                <h1 style={{ textAlign: "left", width: "100%" }}>{feature.text}</h1>
                                <Grow in={currentPage === index}>
                                    <div className={styles.featureContent}>
                                        {feature.content}
                                    </div>
                                </Grow>
                            </div>

                    ))}
                    <IconButton
                        onClick={handleNextPage}
                        sx={{
                        margin: 5,
                        color: "#DAD7CD",
                        }}
                        disabled={
                        currentPage >= Math.ceil(features.length || 0) - 1
                        }
                    >
                        <NavigateNextIcon />
                    </IconButton>
                </div>
            </section>
            <section id="steps" className={styles.steps}>
                <Steps></Steps>
            </section>
            <section id="pricing" className={styles.pricing}>
                <h1 style={{ fontSize: "60px", textAlign: "center", fontFamily: "Tahoma", marginBottom: "10px" }}>Only $3 a Month</h1>
                <p style={{ fontSize: "1.2rem", textAlign: "center", width: "40%", marginLeft: "auto", marginRight: "auto" }}>Your money should go to your investments, not tools; the most affordable stock analysis app.</p>
                <div className={styles.pricingContent}>
                    <div className={styles.pricingCard}>
                        <h2>Monthly</h2>
                        <p><span style={{ fontSize: "60px" }}>$3</span> / month</p>
                        <StyledFab
                        href="/sign-in"
                        variant="extended"
                        >
                            Subscribe
                        </StyledFab>
                        <p style={{ color: "grey" }}>All features</p>
                        <Divider></Divider>
                        <div className={styles.pricingFeatureContainer} style={{ marginTop: "25px" }}>
                            <StyledDoneIcon />
                            <p>Unlimited stock search</p>
                        </div>
                        <div className={styles.pricingFeatureContainer}>
                            <StyledDoneIcon />
                            <p>and many more in the futures</p>
                        </div>
                    </div>
                </div>
            </section>
            <section id="FAQ" className={styles.FAQ} >
                <h1 style={{ marginBottom: "50px" }}>Frequently asked questions</h1>
                <FAQ />
            </section>
            <footer className={styles.footer}>
                <Divider sx={{ borderColor: "rgba(218, 215, 205, 0.5)" }}></Divider>
                <div className={styles.footerContent}>
                    <Brand variant="landing" />
                    <div className={styles.footerRight}>
                        <div className={styles.footerNav}>
                            <h3>Support</h3>
                            <div className={styles.footerNavHyperlinks}>
                                <p>
                                    <a href="mailto: support@corecomp.com" className={styles.footerNavHyperlinksText}>Contact Us</a>
                                </p>
                            </div>
                        </div>
                        <div className={styles.footerNav}>
                            <h3>Legal</h3>
                            <div className={styles.footerNavHyperlinks}>
                                <p>
                                    <a href="/privacy" className={styles.footerNavHyperlinksText}>Privacy Policy</a>
                                </p>
                                <p>
                                    <a href="/terms" className={styles.footerNavHyperlinksText}>Terms of Service</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <Divider sx={{ borderColor: "rgba(218, 215, 205, 0.5)" }}></Divider>
            </footer>
        </>
    )
}

export default Landing
