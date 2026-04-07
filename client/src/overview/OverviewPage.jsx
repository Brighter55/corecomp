import {useEffect, useState} from "react"
import { useNavigate } from "react-router-dom";
import ProductHeader from "../headers/product-header/ProductHeader.jsx"
import PeriodSwitch from "./components/PeriodSwitch.jsx"
import SymbolSearch from "../shared/SymbolSearch.jsx"
import { authenticatedClientWithRetry } from "../helpers/api.js"
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
    SharesOutstandingGraph, EPSGraph, PricingGraph, ProfitMarginGraph, GrossProfitGraph, CostOfRevenueGraph,
    ResearchAndDevelopmentGraph, OperatingExpensesGraph, NetIncomeFromContinuingOperationsGraph, ROEGraph,
    PERatioGraph, PSRatioGraph, EbitdaGraph, EbitGraph, PBRatioGraph, MarketCapGraph, TotalAssetsGraph, DebtStructureGraph,
    REarningsVsCStockGraph, DepreciationAndAmortizationGraph, DividendPayoutCommonStockGraph,
    CashflowFromInvestmentGraph, CashflowFromFinancingGraph, CashFlowTrifectaGraph, NetIncomeVsOcfGraph, ChangeInInventoryGraph,
    PFCFRatioGraph,
} from "./index.js"


const GraphsContainer = styled(Stack)({
    width: "95vw",
    maxWidth: "1300px",
    flexWrap: "wrap",
    gap: "1rem",
});

function OverviewPage() {
    const navigate = useNavigate();
    const [symbol, setSymbol] = useState("");
    const [period, setPeriod] = useState("annually");
    const [fetchVersion, setFetchVersion] = useState(0);
    const [pricingStatement, setPricingStatement] = useState(null);
    const [dividendsStatement, setDividendsStatement] = useState(null);
    const [earningsStatement, setEarningsStatement] = useState(null);
    const [incomeStatement, setIncomeStatement] = useState(null);
    const [cashFlowStatement, setCashFlowStatement] = useState(null);
    const [balanceSheetStatement, setBalanceSheetStatement] = useState(null);
    const [roeStatement, setRoeStatement] = useState(null);
    const [peStatement, setPeStatement] = useState(null);
    const [pbStatement, setPbStatement] = useState(null);
    const [psStatement, setPsStatement] = useState(null);
    const [pfcfStatement, setPfcfStatement] = useState(null);
    const [marketCapStatement, setMarketCapStatement] = useState(null);


    function handleSearchSubmit(event, symbolFromChild) {
        event.preventDefault();

        setSymbol(symbolFromChild);
        console.log("sent", symbol);
        setFetchVersion(v => v + 1);
    }

    useEffect(() => {
        if (!symbol) {
            setPricingStatement(null);
            return;
        }

        async function getPricingStatement() {
            const payload = {symbol: symbol};
            const response = await authenticatedClientWithRetry("/pages/pricing", payload, () => isActive, navigate, setSymbol);
            if (!isActive) {
                return;
            }
            if (response.status === 204) {
                setPricingStatement([]);
                return;
            }
            const data = await response.json();
            setPricingStatement(data);
        }

        let isActive = true;
        getPricingStatement();

        return  () => {
            isActive = false;
        };
    }, [symbol, fetchVersion, navigate]);

    useEffect(() => {
        if (!symbol) {
            setDividendsStatement(null);
            return;
        }

        async function getDividendsStatement() {
            const payload = {symbol: symbol};
            const response = await authenticatedClientWithRetry("/pages/dividends", payload, () => isActive, navigate, setSymbol);
            if (!isActive) {
                return;
            }
            if (response.status === 204) {
                setDividendsStatement([]);
                return;
            }
            const data = await response.json();
            setDividendsStatement(data);
        }

        let isActive = true;
        getDividendsStatement();

        return  () => {
            isActive = false;
        };
    }, [symbol, fetchVersion, navigate]);

    useEffect(() => {
        if (!symbol) {
            setEarningsStatement(null);
            return;
        }

        async function getEarningsStatement() {
            const payload = {symbol: symbol};
            const response = await authenticatedClientWithRetry("/pages/earnings", payload, () => isActive, navigate, setSymbol);
            if (!isActive) {
                return;
            }
            if (response.status === 204) {
                setEarningsStatement([]);
                return;
            }
            const data = await response.json();
            setEarningsStatement(data);
        }

        let isActive = true;
        getEarningsStatement();

        return  () => {
            isActive = false;
        };
    }, [symbol, fetchVersion, navigate]);

    useEffect(() => {
        if (!symbol) {
            setIncomeStatement(null);
            return;
        }

        async function getIncomeStatement() {
            const payload = {symbol: symbol};
            const response = await authenticatedClientWithRetry("/pages/income-statement", payload, () => isActive, navigate, setSymbol);
            if (!isActive) {
                return;
            }
            if (response.status === 204) {
                setIncomeStatement([]);
                return;
            }
            const data = await response.json();
            setIncomeStatement(data);
        }

        let isActive = true;
        getIncomeStatement();

        return  () => {
            isActive = false;
        };
    }, [symbol, fetchVersion, navigate]);

    useEffect(() => {
        if (!symbol) {
            setCashFlowStatement(null);
            return;
        }

        async function getCashFlowStatement() {
            const payload = {symbol: symbol};
            const response = await authenticatedClientWithRetry("/pages/cash-flow", payload, () => isActive, navigate, setSymbol);
            if (!isActive) {
                return;
            }
            if (response.status === 204) {
                setCashFlowStatement([]);
                return;
            }
            const data = await response.json();
            setCashFlowStatement(data);
        }

        let isActive = true;
        getCashFlowStatement();

        return  () => {
            isActive = false;
        };
    }, [symbol, fetchVersion, navigate]);

    useEffect(() => {
        if (!symbol) {
            setBalanceSheetStatement(null);
            return;
        }

        async function getBalanceSheetStatement() {
            const payload = {symbol: symbol};
            const response = await authenticatedClientWithRetry("/pages/balance-sheet", payload, () => isActive, navigate, setSymbol);
            if (!isActive) {
                return;
            }
            if (response.status === 204) {
                setBalanceSheetStatement([]);
                return;
            }
            const data = await response.json();
            setBalanceSheetStatement(data);
        }

        let isActive = true;
        getBalanceSheetStatement();

        return  () => {
            isActive = false;
        };
    }, [symbol, fetchVersion, navigate]);

    useEffect(() => {
        if (!symbol) {
            setRoeStatement(null);
            return;
        }

        async function getRoeStatement() {
            const payload = {symbol: symbol, graph: "ROEPercentage"};
            const response = await authenticatedClientWithRetry("/pages/composite", payload, () => isActive, navigate, setSymbol);
            if (!isActive) {
                return;
            }
            if (response.status === 204) {
                setRoeStatement([]);
                return;
            }
            const data = await response.json();
            setRoeStatement(data);
        }

        let isActive = true;
        getRoeStatement();

        return  () => {
            isActive = false;
        };
    }, [symbol, fetchVersion, navigate]);

    useEffect(() => {
        if (!symbol) {
            setPeStatement(null);
            return;
        }

        async function getPeStatement() {
            const payload = {symbol: symbol, graph: "PERatio"};
            const response = await authenticatedClientWithRetry("/pages/composite", payload, () => isActive, navigate, setSymbol);
            if (!isActive) {
                return;
            }
            if (response.status === 204) {
                setPeStatement([]);
                return;
            }
            const data = await response.json();
            setPeStatement(data);
        }

        let isActive = true;
        getPeStatement();

        return  () => {
            isActive = false;
        };
    }, [symbol, fetchVersion, navigate]);

    useEffect(() => {
        if (!symbol) {
            setMarketCapStatement(null);
            return;
        }

        async function getMarketCapStatement() {
            const payload = {symbol: symbol, graph: "MarketCap"};
            const response = await authenticatedClientWithRetry("/pages/composite", payload, () => isActive, navigate, setSymbol);
            if (!isActive) {
                return;
            }
            if (response.status === 204) {
                setMarketCapStatement([]);
                return;
            }
            const data = await response.json();
            setMarketCapStatement(data);
        }

        let isActive = true;
        getMarketCapStatement();

        return  () => {
            isActive = false;
        };
    }, [symbol, fetchVersion, navigate]);

    useEffect(() => {
        if (!symbol) {
            setPbStatement(null);
            return;
        }

        async function getPbStatement() {
            const payload = {symbol: symbol, graph: "PBRatio"};
            const response = await authenticatedClientWithRetry("/pages/composite", payload, () => isActive, navigate, setSymbol);
            if (!isActive) {
                return;
            }
            if (response.status === 204) {
                setPbStatement([]);
                return;
            }
            const data = await response.json();
            setPbStatement(data);
        }

        let isActive = true;
        getPbStatement();

        return  () => {
            isActive = false;
        };
    }, [symbol, fetchVersion, navigate]);

    useEffect(() => {
        if (!symbol) {
            setPsStatement(null);
            return;
        }

        async function getPsStatement() {
            const payload = {symbol: symbol, graph: "PSRatio"};
            const response = await authenticatedClientWithRetry("/pages/composite", payload, () => isActive, navigate, setSymbol);
            if (!isActive) {
                return;
            }
            if (response.status === 204) {
                setPsStatement([]);
                return;
            }
            const data = await response.json();
            setPsStatement(data);
        }

        let isActive = true;
        getPsStatement();

        return  () => {
            isActive = false;
        };
    }, [symbol, fetchVersion, navigate]);

    useEffect(() => {
        if (!symbol) {
            setPfcfStatement(null);
            return;
        }

        async function getPfcfStatement() {
            const payload = {symbol: symbol, graph: "PFCFRatio"};
            const response = await authenticatedClientWithRetry("/pages/composite", payload, () => isActive, navigate, setSymbol);
            if (!isActive) {
                return;
            }
            if (response.status === 204) {
                setPfcfStatement([]);
                return;
            }
            const data = await response.json();
            setPfcfStatement(data);
        }

        let isActive = true;
        getPfcfStatement();

        return  () => {
            isActive = false;
        };
    }, [symbol, fetchVersion, navigate]);

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
                    <Stack spacing={2} sx={{ width: "95vw", maxWidth: "1300px" }}>
                        <Typography variant="h4">Pricing</Typography>
                        <GraphsContainer direction={{ xs: "column", md: "row" }}>
                            <PricingGraph statement={pricingStatement} period={period} />
                            <MarketCapGraph statement={marketCapStatement} period={period}/>
                        </GraphsContainer>
                    </Stack>
                    <Stack spacing={2} sx={{ width: "95vw", maxWidth: "1300px" }}>
                        <Typography variant="h4">Dividend Statement</Typography>
                        <GraphsContainer direction={{ xs: "column", md: "row" }}>
                            <DividendsPayoutGraph statement={dividendsStatement} period={period}></DividendsPayoutGraph>
                        </GraphsContainer>
                    </Stack>
                    <PeriodSwitch setPeriod={setPeriod} period={period}></PeriodSwitch>
                    <Stack spacing={2} sx={{ width: "95vw", maxWidth: "1300px" }}>
                        <Typography variant="h4">Earnings Statement</Typography>
                        <GraphsContainer direction={{ xs: "column", md: "row" }}>
                            <EPSGraph statement={earningsStatement} period={period}></EPSGraph>
                        </GraphsContainer>
                    </Stack>
                    <Stack spacing={2} sx={{ width: "95vw", maxWidth: "1300px" }}>
                        <Typography variant="h4">Income Statement</Typography>
                        <GraphsContainer direction={{ xs: "column", md: "row" }}>
                            <ProfitMarginGraph statement={incomeStatement} period={period}></ProfitMarginGraph>
                            <TotalRevenueGraph statement={incomeStatement} period={period} />
                            <GrossProfitGraph statement={incomeStatement} period={period} />
                            <CostOfRevenueGraph statement={incomeStatement} period={period} />
                            <ResearchAndDevelopmentGraph statement={incomeStatement} period={period} />
                            <OperatingExpensesGraph statement={incomeStatement} period={period} />
                            <NetIncomeGraph statement={incomeStatement} period={period}></NetIncomeGraph>
                            <NetIncomeFromContinuingOperationsGraph statement={incomeStatement} period={period} />
                            <EbitGraph statement={incomeStatement} period={period}/>
                            <EbitdaGraph statement={incomeStatement} period={period}/>
                        </GraphsContainer>
                    </Stack>
                    <Stack spacing={2} sx={{ width: "95vw", maxWidth: "1300px" }}>
                        <Typography variant="h4">Cash Flow Statement</Typography>
                        <GraphsContainer direction={{ xs: "column", md: "row" }}>
                            <OperatingCashflowGraph statement={cashFlowStatement} period={period}></OperatingCashflowGraph>
                            <NetIncomeVsOcfGraph statement={cashFlowStatement} period={period} />
                            <CapitalExpendituresGraph statement={cashFlowStatement} period={period}></CapitalExpendituresGraph>
                            <FreeCashflowGraph statement={cashFlowStatement} period={period} />
                            <DepreciationAndAmortizationGraph statement={cashFlowStatement} period={period} />
                            <DividendPayoutCommonStockGraph statement={cashFlowStatement} period={period} />
                            <CashflowFromInvestmentGraph statement={cashFlowStatement} period={period} />
                            <CashflowFromFinancingGraph statement={cashFlowStatement} period={period} />
                            <ChangeInInventoryGraph statement={cashFlowStatement} period={period} />
                            <CashFlowTrifectaGraph statement={cashFlowStatement} period={period} />
                        </GraphsContainer>
                    </Stack>
                    <Stack spacing={2} sx={{ width: "95vw", maxWidth: "1300px" }}>
                        <Typography variant="h4">Balance Sheet Statement</Typography>
                        <GraphsContainer direction={{ xs: "column", md: "row" }}>
                            <TotalAssetsGraph statement={balanceSheetStatement} period={period}/>
                            <DebtStructureGraph statement={balanceSheetStatement} period={period} />
                            <REarningsVsCStockGraph statement={balanceSheetStatement} period={period} />
                            <CashVsDebtGraph statement={balanceSheetStatement} period={period}></CashVsDebtGraph>
                            <SharesOutstandingGraph statement={balanceSheetStatement} period={period}></SharesOutstandingGraph>
                        </GraphsContainer>
                    </Stack>
                    <Stack spacing={2} sx={{ width: "95vw", maxWidth: "1300px" }}>
                        <Typography variant="h4">Ratios Statement</Typography>
                        <GraphsContainer direction={{ xs: "column", md: "row" }}>
                            <ROEGraph statement={roeStatement} period={period} />
                            <PERatioGraph statement={peStatement} period={period}/>
                            <PBRatioGraph statement={pbStatement} period={period}/>
                        </GraphsContainer>
                    </Stack>
                    <Stack spacing={2} sx={{ width: "95vw", maxWidth: "1300px" }}>
                        <Typography variant="h4">Price Ratio</Typography>
                        <GraphsContainer direction={{ xs: "column", md: "row" }}>
                            <PSRatioGraph statement={psStatement} period={period}/>
                            <PFCFRatioGraph statement={pfcfStatement} period={period}/>
                        </GraphsContainer>
                    </Stack>
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
