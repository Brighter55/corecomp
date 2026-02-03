import { useParams, useNavigate } from 'react-router-dom';
import {useEffect} from "react"
import { authenticatedClient } from "./helpers/api.js"

function Return() {
    const {checkout_session_id} = useParams();
    const navigate = useNavigate()

    /*Check if authorized as well as renew tokens if expired*/
    useEffect(() => {
        async function initialize() {
            const response = await authenticatedClient({endpoint: "/billings/session-status", payload: {sessionId: checkout_session_id}});
            const session = await response.json();
            if (["open", "expired"].includes(session.status)) {
                navigate("/account");
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
