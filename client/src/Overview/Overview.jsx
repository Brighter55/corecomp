import {useState} from "react"
import {useNavigate} from "react-router-dom"
import {useEffect} from "react"
import AppHeader from "../AppHeader/AppHeader.jsx"
import styles from "./Overview.module.css"
import PeriodSwitch from "./PeriodSwitch.jsx"

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

    const [company, setCompany] = useState("");
    const [period, setPeriod] = useState("annually");

    async function handleSearchSubmit(event) {
        event.preventDefault();

        const payload = {company: company, period: period};
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
            console.log(data.success);
        } catch (error) {
            console.error("Error:", error)
        }
    }

    return (
        <>
            <AppHeader></AppHeader>
            <div className={styles.overviewContent}>
                <form className={styles.form} onSubmit={handleSearchSubmit}>
                    <input value={company} onChange={(event) => {setCompany(event.target.value)}} className={styles.searchBar} type="search" />
                </form>
                <PeriodSwitch setPeriod={setPeriod} period={period}></PeriodSwitch>
            </div>
        </>
    )
}

export default Overview
