import { useParams } from 'react-router-dom';

function Return() {
    const {checkout_session_id} = useParams();

    async function initialize() {
        const response = fetch("", {
            method: "POST",
            headers
        });
    }
    return (
        <>
            <h1>Payment Successful</h1>
        </>
    )
}

export default Return
