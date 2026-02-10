import LandingHeader from "../headers/LandingHeader.jsx"
import { useState } from "react"
import explanationImage from "../assets/explanation.png"
import SampleIncomeGraph from "./components/SampleIncomeGraph.jsx"
import GraphsCarousel from "./components/GraphsCarousel.jsx"
import FAQ from "./components/FAQ.jsx"
import Steps from "./components/Steps.jsx"
import Footer from "../shared/Footer.jsx"
import { useNavigate } from "react-router-dom"
// mui components
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import DoneIcon from '@mui/icons-material/Done';
import { styled } from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Grow from '@mui/material/Grow';
import Stack from '@mui/system/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function Landing() {
    const navigate = useNavigate();
    const features = ([
        {
            id: 0,
            text: "Over 20 years of comprehensive financial data that provides a broad view of any company.",
            content: <SampleIncomeGraph />
        },
        {
            id: 1,
            text: "10+  fundamentals to help you truly understand a company’s performance",
            content: <GraphsCarousel/>
        },
        {
            id: 2,
            text: "Beginners? Professionals? CoreComp explains everything in simple terms!",
            content: <Box component="img" src={explanationImage} sx={{ width: {xs: "100%", sm: "30rem", md: "40rem"}, height: "100%", borderRadius: "10px" }} />
        },
    ]);
    const [currentPage, setCurrentPage] = useState(0);

    function handleNextPage() {
        setCurrentPage((currentPage) => currentPage + 1);
    }

    function handlePrevPage() {
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
        <Container maxWidth="lg">
            <LandingHeader />
            <Stack spacing={18}>
                <section id="hero" style={{ display: "flex", justifyContent: "center" }}>
                    <Stack sx={{ alignItems: "center" }} spacing={3}>
                        <Typography variant="h2" textAlign="center" sx={{ fontFamily: "Montserrat", width: {xs: "100%", md: "60%"} }}>An “every Core detail of a Company” app</Typography>
                        <Divider sx={{ width: "30%", bgcolor: "var(--main-dust-grey)" }}></Divider>
                        <Typography variant="body1" textAlign="center" sx={{ width: {xs: "80%", md: "50%"} }}>Turns complex financial data into simple, easy-looking graphs with over 20+ years of financial data and clear, beginner-friendly explanations.</Typography>
                        <Fab variant="extended" onClick={handleTryClicked} sx={{ backgroundColor: "#DAD7CD", textTransform: 'none', "&:hover": {backgroundColor: "#588157"} }}>Get Started</Fab>
                    </Stack>
                </section>
                <section id="features" style={{
                    backgroundColor: "#746355",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    boxShadow: "0 0 10px 2px black",
                    paddingBottom: "2rem",
                    paddingTop: "2rem",
                }}>
                    <IconButton
                        onClick={handlePrevPage}
                        sx={{ margin: 0, color: "#DAD7CD" }}
                        disabled={currentPage === 0}
                    >
                        <NavigateBeforeIcon />
                    </IconButton>
                    {features.map((feature, index) => (
                    <Stack
                        useFlexGap
                        spacing={4}
                        sx={{
                            display: currentPage === index ? "flex" : "none",
                            flex: 1,
                            overflow: "hidden",
                        }}
                    >
                        <Typography variant="h5" sx={{ fontWeight: "bold" }}>{feature.text}</Typography>
                        <Grow in={currentPage === index}>
                            <Box
                                sx={{
                                    height: {xs: "20rem", md: "30rem"},
                                    display: "flex",
                                    justifyContent: "center",
                                }}>
                                {feature.content}
                            </Box>
                        </Grow>
                    </Stack>
                    ))}
                    <IconButton
                        onClick={handleNextPage}
                        sx={{
                        margin: 0,
                        color: "#DAD7CD",
                        }}
                        disabled={
                        currentPage >= Math.ceil(features.length || 0) - 1
                        }
                    >
                        <NavigateNextIcon />
                    </IconButton>
                </section>
                <section id="steps">
                    <Steps></Steps>
                </section>
                <section id="pricing">
                    <Stack spacing={2} sx={{ alignItems: "center" }}>
                        <Typography variant="h2">Only $3 a Month</Typography>
                        <Typography
                            textAlign="center"
                            variant="body1"
                            sx={{ width: {xs: "80%", md: "50%"} }}
                        >
                            Your money should go to your investments, not tools; the most affordable stock analysis app.
                        </Typography>
                        <Stack
                            sx={{
                                width: {xs: "70%", md: "30%"},
                                height: "22rem",
                                borderRadius: "30px",
                                border: "5px solid white",
                                backgroundColor: "#f7f6f2",
                                padding: "2rem",
                                color: "#2f3037",
                                boxShadow: "0 0 40px 5px white",
                                marginTop: "3rem !important"
                            }}
                            spacing={2}
                        >
                            <Typography variant="h5">Monthly</Typography>
                            <Typography variant="body1">
                                <Typography variant="h2" component="span" sx={{ fontWeight: "normal" }}>$3</Typography>
                                / month
                            </Typography>
                            <StyledFab
                                onClick={() => {navigate("/sign-up")}}
                                variant="extended"
                                sx={{ height: "3rem" }}
                            >
                                Subscribe
                            </StyledFab>
                            <Typography variant="body1">All features</Typography>
                            <Divider></Divider>
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                <StyledDoneIcon />
                                <Typography variant="body1">Unlimited stock search</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                <StyledDoneIcon />
                                <Typography variant="body1">and many more in the futures</Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                </section>
                <section id="FAQ">
                    <Stack spacing={3}>
                        <Typography variant="h4">Frequently Asked Questions</Typography>
                        <FAQ />
                    </Stack>
                </section>
                <Footer />
            </Stack>
        </Container>
    )
}

export default Landing
