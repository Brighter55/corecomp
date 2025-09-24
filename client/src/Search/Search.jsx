import {useState} from "react"
import {useNavigate} from "react-router-dom"
import {useEffect} from "react"
import AppHeader from "../AppHeader/AppHeader.jsx"
import styles from "./Search.module.css"

function Search() {
    // when opens up the page check if user is authorized
    const navigate = useNavigate();
    useEffect(() => {
        if (!(sessionStorage.getItem("access") && sessionStorage.getItem("refresh"))) {
            navigate("/sign-up");
        }
    }, []);

    const [company, setCompany] = useState("");

    async function handleSearchSubmit(event) {
        event.preventDefault();

        const payload = {company: company};
        try {
            const response = await fetch("http://127.0.0.1:8000/api/search", {
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
            <div className={styles.searchContent}>
                <form className={styles.form} onSubmit={handleSearchSubmit}>
                    <input value={company} onChange={(event) => {setCompany(event.target.value)}} className={styles.searchBar} type="search" />
                </form>
            </div>
        </>
    )
}

export default Search
