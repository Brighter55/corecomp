import {useState, useRef} from "react"
import {useEffect} from "react"
import ProductHeader from "../headers/product-header/ProductHeader.jsx"
import PeriodSwitch from "./components/PeriodSwitch.jsx"
import {useNavigate} from "react-router-dom"
// mui components
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
// components
import { Hero, About, Fundamentals, TotalRevenueGraph, NetIncomeGraph, OperatingCashflowGraph,
    CapitalExpendituresGraph, FreeCashflowGraph, DividendsPayoutGraph, CashVsDebtGraph,
    SharesOutstandingGraph, EPSGraph, PricingGraph
} from "./index.js"
import StyledTextField from "../shared/StyledTextField.jsx"
// helpers
import {checkPermission} from "../helpers/helper.js"


const GraphsContainer = styled(Stack)({
    width: "95vw",
    maxWidth: "1300px",
    flexWrap: "wrap",
    gap: "1rem",
});

function OverviewPage() {
    // when opens up the page check if user is authorized
    // TODO: implement "refresh lock" in prod. to prevent multiple components hitting refreshing the tokens
    const ran = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        /*prevent checkPermission to run second time in developement*/
        if (ran.current) {return;}
        ran.current = true;
        checkPermission(navigate);
    }, []);


    const [symbol, setSymbol] = useState("");
    const [period, setPeriod] = useState("annually");
    const [fetchVersion, setFetchVersion] = useState(0);
    const [input, setInput] = useState("");

    async function handleSearchSubmit(event) {
        event.preventDefault();
        setSymbol(input);
        setFetchVersion(v => v + 1);
    }

    if (symbol) {
        return (
            <Container maxWidth="lg">
                <ProductHeader></ProductHeader>
                <Stack spacing={5} sx={{ alignItems: "center" }}>
                    <form onSubmit={handleSearchSubmit} style={{ width: "50%" }}>
                        <StyledTextField
                            label="stock symbol"
                            value={input}
                            onChange={(event) => {setInput(event.target.value)}}
                            sx={{ width: "100%" }}
                        />
                    </form>
                    <Hero symbol={symbol} fetchVersion={fetchVersion} setSymbol={setSymbol}></Hero>
                    {/*
                    <About></About>
                    <Fundamentals></Fundamentals>
                    <GraphsContainer direction={{ xs: "column", md: "row" }}>
                        <DividendsPayoutGraph reports={reports.DIVIDENDS}></DividendsPayoutGraph>
                        <SharesOutstandingGraph reports={reports.SHARES_OUTSTANDING}></SharesOutstandingGraph>
                        <PricingGraph reports={reports.PRICING}></PricingGraph>
                    </GraphsContainer>
                    */}
                    {/*
                    <PeriodSwitch setPeriod={setPeriod} period={period}></PeriodSwitch>
                    <GraphsContainer direction={{ xs: "column", md: "row" }}>
                        <TotalRevenueGraph reports={reports.INCOME_STATEMENT}></TotalRevenueGraph>
                        <NetIncomeGraph reports={reports.INCOME_STATEMENT}></NetIncomeGraph>
                        <OperatingCashflowGraph reports={reports.CASH_FLOW}></OperatingCashflowGraph>
                        <CapitalExpendituresGraph reports={reports.CASH_FLOW}></CapitalExpendituresGraph>
                        <FreeCashflowGraph reports={reports.CASH_FLOW} ></FreeCashflowGraph>
                        <CashVsDebtGraph reports={reports.BALANCE_SHEET} ></CashVsDebtGraph>
                        <EPSGraph reports={reports.EARNINGS} period={period}></EPSGraph>
                    </GraphsContainer>
                    */}
                </Stack>
            </Container>
        )
    }

    return (
        <Container maxWidth="lg">
            <ProductHeader></ProductHeader>
            <Stack
                spacing={2}
                sx={{
                    height: "30rem",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "70%",
                    justifySelf: "center",
                }}
            >
                <Typography
                    variant="h2"
                    sx={{
                        fontWeight: "normal",
                        textAlign: "center",
                    }}
                >
                    Enter stock symbol and get started now!
                </Typography>
                <form onSubmit={handleSearchSubmit} style={{ width: "100%" }}>
                    <StyledTextField
                        label="stock symbol"
                        value={input}
                        onChange={(event) => {setInput(event.target.value)}}
                        sx={{ width: "100%" }}
                    />
                </form>
            </Stack>
        </Container>
    )
}

export default OverviewPage
