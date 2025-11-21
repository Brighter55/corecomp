
import { useParams } from "react-router-dom"

function ConfirmResetPassword() {
    // make a form that ask user for new password and confirmPassword and send to Django endpoint
    // payload should include {password: password, confirmPassword: confirmPassword, user_id: user_id, token: token}
    const { token, user_id } = useParams();

    return (
        <>
            <h1>Your token is {token} </h1>
            <h1>Your encoded user_id is {user_id}</h1>
        </>
    )
}


export default ConfirmResetPassword
