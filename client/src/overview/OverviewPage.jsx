import {useState, useRef} from "react"
import {useNavigate} from "react-router-dom"
import {useEffect} from "react"
import ProductHeader from "../headers/product-header/ProductHeader.jsx"
import styles from "./OverviewPage.module.css"
import PeriodSwitch from "./components/period-switch/PeriodSwitch.jsx"
// mui components
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// components
import { About, Fundamentals, TotalRevenueGraph, NetIncomeGraph, OperatingCashflowGraph,
    CapitalExpendituresGraph, FreeCashflowGraph, DividendsPayoutGraph, CashVsDebtGraph,
    SharesOutstandingGraph, EPSGraph, PricingGraph
} from "./index.js"
import StyledTextField from "../shared/StyledTextField.jsx"
// pictures
import logo from "../assets/logoPlaceholder.png"
// helpers
import {checkPermission, getNewTokens} from "../helpers/helper.js"


function OverviewPage() {
    // when opens up the page check if user is authorized
    // TODO: implement "refresh lock" in prod. to prevent multiple components hitting refreshing the tokens
    const navigate = useNavigate();
    const ran = useRef(false);

    useEffect(() => {
        /*prevent checkPermission to run second time in developement*/
        if (ran.current) {return;}
        ran.current = true;
        checkPermission(navigate);
    }, []);

    const [symbol, setSymbol] = useState("");
    const [period, setPeriod] = useState("annually");
    const [reports, setReports] = useState([]);
    const [searched, setSearched] = useState(false);


    async function getReports() {
        const payload = {symbol: symbol, period: period};
        const response = await fetch("http://127.0.0.1:8000/api/overview", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("access")}`,
                },
                body: JSON.stringify(payload),
        });
        return response
    }

    async function handleSearchSubmit(event) {
        event.preventDefault();
        try {
            let response = await getReports();
            let data = await response.json();

            /*get new tokens if access expires*/
            if (!response.ok) {
                if (data?.messages?.[0]?.message === "Token is expired") {
                    await getNewTokens(data, navigate);
                    response = await getReports();
                    data = await response.json();
                } else if (response.status === 403) { /*Unauthorized user, aka, don't have permission to use*/
                    navigate("/user-account");
                } else {
                    navigate("/sign-up");
                }
            }


            setReports(data);
            console.log(data);
            setSearched(true);
        } catch (error) {
            console.error("Error:", error)
        }
    }

    if (searched) {
        return (
            <Container maxWidth="lg">
                <ProductHeader></ProductHeader>
                <Stack spacing={5} sx={{ alignItems: "center" }}>
                    <form onSubmit={handleSearchSubmit} style={{ width: "50%" }}>
                        <StyledTextField
                            label="stock symbol"
                            value={symbol}
                            onChange={(event) => {setSymbol(event.target.value)}}
                            sx={{ width: "100%" }}
                        />
                    </form>
                    <Stack
                        direction="row"
                        sx={{ width: "100%", alignItems: "center" }}
                        spacing={5}
                    >
                        <Box
                            component="img"
                            src={logo}
                            sx={{
                                width: {xs: "7rem", sm: "15rem", md: "20rem"},
                                height: {xs: "7rem", sm: "15rem", md: "20rem"},
                                borderRadius: "50%"
                            }}
                        />
                        <Stack spacing={2}>
                            <Typography sx={{ fontSize: { xs: "2rem", sm: "3rem", md: "4rem" }, fontWeight: "bold" }}>Microsoft | MSFT</Typography>
                            <Typography sx={{ fontSize: { xs: "2rem", sm: "3rem", md: "4rem" }, fontWeight: "bold" }}>500 <Typography component="span" sx={{ fontSize: { xs: "1rem", sm: "2rem", md: "3rem" }, fontWeight: "bold" }}>USD</Typography></Typography>
                        </Stack>
                    </Stack>
                    <About></About>
                    <Fundamentals></Fundamentals>
                    <div className={styles.graphs}>
                        <div className={styles.row}>
                            <DividendsPayoutGraph reports={reports.DIVIDENDS}></DividendsPayoutGraph>
                            <SharesOutstandingGraph reports={reports.SHARES_OUTSTANDING}></SharesOutstandingGraph>
                            <PricingGraph reports={reports.PRICING}></PricingGraph>
                        </div>
                    </div>
                    <PeriodSwitch setPeriod={setPeriod} period={period}></PeriodSwitch>
                    <div className={styles.graphs}>
                        <div className={styles.row}>
                            <TotalRevenueGraph reports={reports.INCOME_STATEMENT}></TotalRevenueGraph>
                            <NetIncomeGraph reports={reports.INCOME_STATEMENT}></NetIncomeGraph>
                            <OperatingCashflowGraph reports={reports.CASH_FLOW}></OperatingCashflowGraph>
                        </div>
                        <div className={styles.row}>
                            <CapitalExpendituresGraph reports={reports.CASH_FLOW}></CapitalExpendituresGraph>
                            <FreeCashflowGraph reports={reports.CASH_FLOW} ></FreeCashflowGraph>
                            <CashVsDebtGraph reports={reports.BALANCE_SHEET} ></CashVsDebtGraph>
                        </div>
                        <div className={styles.row}>
                            <EPSGraph reports={reports.EARNINGS} period={period}></EPSGraph>
                        </div>
                    </div>
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
                        value={symbol}
                        onChange={(event) => {setSymbol(event.target.value)}}
                        sx={{ width: "100%" }}
                    />
                </form>
            </Stack>
        </Container>
    )
}

export default OverviewPage
