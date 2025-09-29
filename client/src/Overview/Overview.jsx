import {useState} from "react"
import {useNavigate} from "react-router-dom"
import {useEffect} from "react"
import AppHeader from "../AppHeader/AppHeader.jsx"
import styles from "./Overview.module.css"
import PeriodSwitch from "./PeriodSwitch.jsx"
import About from "./About.jsx"
import Fundamentals from "./Fundamentals.jsx"

// pictures
import logo from "../assets/logoPlaceholder.png"

function Overview() {
    // when opens up the page check if user is authorized
    // TODO: handle when the the token expires
    const navigate = useNavigate();

    useEffect(() => {
        async function isAuthorized() {
            const response = await fetch("http://127.0.0.1:8000/api/is-authorized", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${sessionStorage.getItem("access")}`,
                },
            });
            if (!response.ok) {
                navigate("/sign-up");
            }
        }

        isAuthorized();
    }, []);

    const [symbol, setSymbol] = useState("");
    const [period, setPeriod] = useState("annually");
    const [reports, setReports] = useState([]);

    async function handleSearchSubmit(event) {
        event.preventDefault();

        const payload = {symbol: symbol, period: period};
        try {
            const response = await fetch("http://127.0.0.1:8000/api/overview", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("access")}`,
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
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
                <PeriodSwitch setPeriod={setPeriod} period={period}></PeriodSwitch>
            </div>
        </>
    )
}

export default Overview
