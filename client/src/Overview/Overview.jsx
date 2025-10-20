import {useState, useRef} from "react"
import {useNavigate} from "react-router-dom"
import {useEffect} from "react"
import AppHeader from "../AppHeader/AppHeader.jsx"
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

// pictures
import logo from "../assets/logoPlaceholder.png"

function Overview() {
    // when opens up the page check if user is authorized
    // TODO: implement "refresh lock" in prod. to prevent multiple components hitting refreshing the tokens
    const navigate = useNavigate();
    const ran = useRef(false);

    useEffect(() => {
        async function checkPermission() {
            const response = await fetch("http://127.0.0.1:8000/api/check-permission", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${sessionStorage.getItem("access")}`,
                },
            });
            const data = await response.json();

            /*get new tokens if access expires*/
            if (!response.ok) {
                if (data?.messages?.[0]?.message === "Token is expired") {
                    const response = await fetch("http://127.0.0.1:8000/api/refresh", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({refresh: sessionStorage.getItem("refresh")})
                    });
                    if (response.status === 403) { /*Handle user's trial expires and not subscribe*/
                        console.log("exceed trial_expiry and not pay, navigate to payment page");
                        navigate("/user-account");
                    } else if (!response.ok) { /*Refresh expires in general needs log in again*/
                        console.log("refresh is invalid");
                        navigate("/sign-in");
                        return;
                    }

                    const data = await response.json();
                    sessionStorage.setItem("access", data.access);
                    sessionStorage.setItem("refresh", data.refresh);
                    console.log(`recieved new pair of tokens. {access: ${sessionStorage.getItem("access")}, refresh: ${sessionStorage.getItem("refresh")}`);
                } else {
                    navigate("/sign-up");
                }
            }

            const permission = data.permission;
            if (permission === "IsAuthenticated") {
                navigate("/user-account");
            }
        }
        /*prevent checkPermission to run second time in developement*/
        if (ran.current) {return;}
        ran.current = true;
        checkPermission();
    }, []);

    const [symbol, setSymbol] = useState("");
    const [period, setPeriod] = useState("annually");
    const [reports, setReports] = useState([]);

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
                    const refreshResponse = await fetch("http://127.0.0.1:8000/api/refresh", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({refresh: sessionStorage.getItem("refresh")})
                    });
                    if (refreshResponse.status === 403) { /*Handle user's trial expires and not subscribe*/
                        console.log("exceed trial_expiry and not pay, navigate to payment page");
                        return;
                    } else if (!refreshResponse.ok) { /*Refresh expires in general needs log in again*/
                        console.log("refresh is invalid");
                        navigate("/sign-in");
                        return;
                    }

                    const tokens = await refreshResponse.json();
                    sessionStorage.setItem("access", tokens.access);
                    sessionStorage.setItem("refresh", tokens.refresh);
                    console.log(`recieved new pair of tokens. {access: ${sessionStorage.getItem("access")}, refresh: ${sessionStorage.getItem("refresh")}`);
                    response = await getReports();
                    data = await response.json();
                } else {
                    navigate("/sign-up");
                }
            }


            setReports(data);
            console.log(data);
        } catch (error) {
            console.error("Error:", error)
        }
    }

    return (
        <>
            <AppHeader></AppHeader>
            <div className={styles.overviewContent}>
                <form className={styles.form} onSubmit={handleSearchSubmit}>
                    <input value={symbol} onChange={(event) => {setSymbol(event.target.value)}} className={styles.searchBar} type="search" />
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
                <div className={styles.graphs} >
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

export default Overview
