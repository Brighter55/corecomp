import { useParams, useNavigate } from 'react-router-dom';
import {useEffect} from "react"


function Return() {
    const {checkout_session_id} = useParams();
    const navigate = useNavigate()

    /*Check if authorized as well as renew tokens if expired*/
    useEffect(() => {
        async function initialize() {
            const response = await fetch("http://127.0.0.1:8000/billings/session-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("access")}`,
                },
                body: JSON.stringify({sessionId: checkout_session_id}),
            });
            const session = await response.json();
            if (["open", "expired"].includes(session.status)) {
                navigate("/user-account");
            } else if (session.status == "complete") {
                /*send a request to Django to update database*/
                navigate("/overview");
            }

        }

        initialize();
    }, []);

    return (
        <>
        </>
    )
}

export default Return;
