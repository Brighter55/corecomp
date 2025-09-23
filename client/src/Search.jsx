import {useNavigate} from "react-router-dom"
import {useEffect} from "react"

function Search() {
    const navigate = useNavigate();
    // when opens up the page check if user is authorized
    useEffect(() => {
        if (!(sessionStorage.getItem("access") && sessionStorage.getItem("refresh"))) {
            navigate("/sign-up");
        }
    }, []);


    return (
        <h1>Search page</h1>
    )
}

export default Search
