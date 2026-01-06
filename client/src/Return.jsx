import { useParams, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect} from "react"
import { checkPermission } from "./helpers/helper.js"


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
            const response = await fetch("http://127.0.0.1:8000/billings/session-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("access")}`,
                },
                body: JSON.stringify({sessionId: checkout_session_id}),
            });
            const session = await response.json();
            if (session.status == "open") {
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
