import {useState} from "react"
import ProductHeader from "../headers/product-header/ProductHeader.jsx"
import PeriodSwitch from "./components/PeriodSwitch.jsx"
import SymbolSearch from "../shared/SymbolSearch.jsx"
// mui components
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from "@mui/material/IconButton";
// components
import { Hero, Info, TotalRevenueGraph, NetIncomeGraph, OperatingCashflowGraph,
    CapitalExpendituresGraph, FreeCashflowGraph, DividendsPayoutGraph, CashVsDebtGraph,
    SharesOutstandingGraph, EPSGraph, PricingGraph, ProfitMarginGraph, ROEGraph,
    PERatioGraph, EbitdaGraph, EbitGraph
} from "./index.js"


const GraphsContainer = styled(Stack)({
    width: "95vw",
    maxWidth: "1300px",
    flexWrap: "wrap",
    gap: "1rem",
});

function OverviewPage() {
    const [symbol, setSymbol] = useState("");
    const [period, setPeriod] = useState("annually");
    const [fetchVersion, setFetchVersion] = useState(0);


    function handleSearchSubmit(event, symbolFromChild) {
        event.preventDefault();

        setSymbol(symbolFromChild);
        console.log("sent", symbol);
        setFetchVersion(v => v + 1);
    }

    if (symbol) {
        return (
            <Container maxWidth="lg">
                <ProductHeader></ProductHeader>
                <IconButton sx={{ color: "var(--main-grey)" }} onClick={() => {setSymbol("")}}>
                    <ArrowBackIcon/>
                </IconButton>
                <Stack spacing={5} sx={{ alignItems: "center" }}>
                    <Hero symbol={symbol} fetchVersion={fetchVersion} setSymbol={setSymbol}></Hero>
                    <Info symbol={symbol} fetchVersion={fetchVersion} setSymbol={setSymbol}></Info>
                    <GraphsContainer direction={{ xs: "column", md: "row" }}>
                        <DividendsPayoutGraph symbol={symbol} fetchVersion={fetchVersion} setSymbol={setSymbol} period={period}></DividendsPayoutGraph>
                        <PricingGraph symbol={symbol} fetchVersion={fetchVersion} setSymbol={setSymbol} period={period} />
                        <SharesOutstandingGraph symbol={symbol} fetchVersion={fetchVersion} setSymbol={setSymbol} period={period}></SharesOutstandingGraph>
                    </GraphsContainer>
                    <PeriodSwitch setPeriod={setPeriod} period={period}></PeriodSwitch>
                    <GraphsContainer direction={{ xs: "column", md: "row" }}>
                        <ProfitMarginGraph symbol={symbol} fetchVersion={fetchVersion} setSymbol={setSymbol} period={period}></ProfitMarginGraph>
                        <TotalRevenueGraph symbol={symbol} fetchVersion={fetchVersion} setSymbol={setSymbol} period={period} />
                        <NetIncomeGraph symbol={symbol} fetchVersion={fetchVersion} setSymbol={setSymbol} period={period}></NetIncomeGraph>
                        <EbitGraph symbol={symbol} fetchVersion={fetchVersion} setSymbol={setSymbol} period={period}/>
                        <EbitdaGraph symbol={symbol} fetchVersion={fetchVersion} setSymbol={setSymbol} period={period}/>
                        <OperatingCashflowGraph symbol={symbol} fetchVersion={fetchVersion} setSymbol={setSymbol} period={period}></OperatingCashflowGraph>
                        <CapitalExpendituresGraph symbol={symbol} fetchVersion={fetchVersion} setSymbol={setSymbol} period={period}></CapitalExpendituresGraph>
                        <FreeCashflowGraph symbol={symbol} fetchVersion={fetchVersion} setSymbol={setSymbol} period={period} />
                        <CashVsDebtGraph symbol={symbol} fetchVersion={fetchVersion} setSymbol={setSymbol} period={period}></CashVsDebtGraph>
                        <EPSGraph symbol={symbol} fetchVersion={fetchVersion} setSymbol={setSymbol} period={period}></EPSGraph>
                        <ROEGraph symbol={symbol} fetchVersion={fetchVersion} setSymbol={setSymbol} period={period} />
                        <PERatioGraph symbol={symbol} fetchVersion={fetchVersion} setSymbol={setSymbol} period={period}/>
                    </GraphsContainer>
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
                    <SymbolSearch handleSearchSubmit={handleSearchSubmit} />
                </form>
            </Stack>
        </Container>
    )
}

export default OverviewPage
