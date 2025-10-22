import { useParams, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect} from "react"
import { checkPermission } from "./helpers/checkPermission.js"


function Return() {
    const {checkout_session_id} = useParams();
    const navigate = useNavigate()
    const ran = useRef(false);

    /*Check if authorized as well as renew tokens if expired*/
    useEffect(() => {
        /*prevent checkPermission to run second time in developement*/
        if (ran.current) {return;}
        ran.current = true;
        checkPermission(navigate);


        async function initialize() {
            const response = await fetch("http://127.0.0.1:8000/api/session-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("access")}`,
                },
                body: JSON.stringify({sessionId: checkout_session_id}),
            });
            const session = await response.json();
            if (session.status == "open") {
                window.location.replace("http://localhost:5173/user-account");
            } else if (session.status == "complete") {
                document.getElementById('success').classList.remove('hidden');
                document.getElementById('customer-email').textContent = session.customer_email;
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
