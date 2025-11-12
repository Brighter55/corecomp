import {useState, useRef} from "react"
import {useNavigate} from "react-router-dom"
import {useEffect} from "react"
import ProductHeader from "../Headers/product-header/ProductHeader.jsx"
import styles from "./Overview.module.css"
import PeriodSwitch from "./PeriodSwitch.jsx"
import About from "./About.jsx"
import Fundamentals from "./Fundamentals.jsx"
import TotalRevenueGraph from "./TotalRevenueGraph.jsx"
import NetIncomeGraph from "./NetIncomeGraph.jsx"
import OperatingCashflowGraph from "./OperatingCashflowGraph.jsx"
import CapitalExpendituresGraph from "./CapitalExpendituresGraph.jsx"
import FreeCashflowGraph from "./FreeCashflowGraph.jsx"
import DividendsPayoutGraph from "./DividendsPayoutGraph.jsx"
import CashVsDebtGraph from "./CashVsDebtGraph.jsx"
import SharesOutstandingGraph from "./SharesOutstandingGraph.jsx"
import EPSGraph from "./EPSGraph.jsx"
import PricingGraph from "./PricingGraph.jsx"
import TextField from '@mui/material/TextField';
// pictures
import logo from "../assets/logoPlaceholder.png"
// helpers
import {checkPermission, getNewTokens} from "../helpers/helper.js"
// styles
import { overviewBeforeSearchedInput } from "../styles/product.js"

function Overview() {
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
            <>
                <ProductHeader></ProductHeader>
                <div className={styles.overviewContent}>
                    <form className={styles.afterSearchedForm} onSubmit={handleSearchSubmit}>
                        <TextField sx={overviewBeforeSearchedInput}
                                variant="filled"
                                label="stock symbol"
                                value={symbol}
                                onChange={(event) => {setSymbol(event.target.value)}}
                        />
                    </form>
                    <div className={styles.introduction}>
                        <img src={logo} className={styles.logo}></img>
                        <div className={styles.introductionText}>
                            <h2 style={{margin: "20px 0"}}>Microsoft | MSFT</h2>
                            <h2 style={{margin: "20px 0"}}>500 <span style={{fontSize: "25px"}}>USD</span></h2>
                        </div>
                    </div>
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
                            <FreeCashflowGraph reports={reports.CASH_FLOW}></FreeCashflowGraph>
                            <CashVsDebtGraph reports={reports.BALANCE_SHEET}></CashVsDebtGraph>
                        </div>
                        <div className={styles.row}>
                            <EPSGraph reports={reports.EARNINGS} period={period}></EPSGraph>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <ProductHeader></ProductHeader>
            <div className={styles.overviewContentBeforeSearched}>
                <span className={styles.caption}>Enter stock symbol and get started now!</span>
                <form className={styles.beforeSearchedForm} onSubmit={handleSearchSubmit}>
                    <TextField sx={overviewBeforeSearchedInput}
                                variant="filled"
                                label="stock symbol"
                                value={symbol}
                                onChange={(event) => {setSymbol(event.target.value)}}
                    />
                </form>
            </div>
        </>
    )
}

export default Overview
