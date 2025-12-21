// images
import capitalExpendituresGraph from "../../assets/Graphs/capitalExpendituresGraph.png"
import cashVsDebtGraph from "../../assets/Graphs/cashVsDebtGraph.png"
import dividendGraph from "../../assets/Graphs/dividendGraph.png"
import epsGraph from "../../assets/Graphs/epsGraph.png"
import freeCashFlowGraph from "../../assets/Graphs/freeCashFlowGraph.png"
import incomeGraph from "../../assets/Graphs/capitalExpendituresGraph.png"
import operatingCashFlowGraph from "../../assets/Graphs/operatingCashFlowGraph.png"
import pricingGraph from "../../assets/Graphs/pricingGraph.png"
import revenueGraph from "../../assets/Graphs/revenueGraph.png"
import sharesOutstandingGraph from "../../assets/Graphs/sharesOutstandingGraph.png"
// mui components
import { keyframes } from '@mui/system';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

const slide = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
`;

const StyledBox = styled(Box)({
    height: "100%",
    margin: "0 40px",
    borderRadius: "10px",
});

function GraphsCarousel() {

    return (
        <Box
            sx={{
                height: "100%",
                width: "100%",
                overflow: "hidden",
                whiteSpace: "nowrap",
                position: "relative",

                "&::before": {
                    position: "absolute",
                    content: "''",
                    zIndex: 2,
                    width: "10%",
                    height: "100%",
                    background: 'linear-gradient(to left, rgba(255, 255, 255, 0), #746355)',
                },
                "&::after": {
                    position: "absolute",
                    content: "''",
                    zIndex: 2,
                    width: "10%",
                    height: "100%",
                    right: 0,
                    background: 'linear-gradient(to right, rgba(255, 255, 255, 0), #746355)',
                },
                "&:hover .graphImages": {
                    animationPlayState: "paused",
                },
            }}
        >
            <Box
            className="graphImages"
            sx={{ display: "inline-block", animation: `45s ${slide} infinite linear`, height: "100%" }}>
                <StyledBox component="img" src={capitalExpendituresGraph} />
                <StyledBox component="img" src={cashVsDebtGraph} />
                <StyledBox component="img" src={dividendGraph} />
                <StyledBox component="img" src={epsGraph} />
                <StyledBox component="img" src={freeCashFlowGraph} />
                <StyledBox component="img" src={incomeGraph} />
                <StyledBox component="img" src={operatingCashFlowGraph} />
                <StyledBox component="img" src={pricingGraph} />
                <StyledBox component="img" src={revenueGraph} />
                <StyledBox component="img" src={sharesOutstandingGraph} />
            </Box>
            <Box
            className="graphImages"
            sx={{ display: "inline-block", animation: `45s ${slide} infinite linear`, height: "100%" }}>
                <StyledBox component="img" src={capitalExpendituresGraph} />
                <StyledBox component="img" src={cashVsDebtGraph} />
                <StyledBox component="img" src={dividendGraph} />
                <StyledBox component="img" src={epsGraph} />
                <StyledBox component="img" src={freeCashFlowGraph}  />
                <StyledBox component="img" src={incomeGraph} />
                <StyledBox component="img" src={operatingCashFlowGraph} />
                <StyledBox component="img" src={pricingGraph} />
                <StyledBox component="img" src={revenueGraph} />
                <StyledBox component="img" src={sharesOutstandingGraph} />
            </Box>
        </Box>
    )
}


export default GraphsCarousel
