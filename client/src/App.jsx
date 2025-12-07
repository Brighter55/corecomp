import {BrowserRouter, Routes, Route} from "react-router-dom"
import Landing from "./landing-page/Landing.jsx"
import SignIn from "./sign-in/SignIn.jsx"
import SignUp from "./sign-up/SignUp.jsx"
import OverviewPage from "./overview/OverviewPage.jsx"
import AccountVerification from "./AccountVerification.jsx"
import UserAccount from "./UserAccount.jsx"
import Return from "./Return.jsx"
import ResetPassword from "./ResetPassword.jsx"
import ConfirmResetPassword from "./confirm-reset-password/ConfirmResetPassword.jsx"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing></Landing>} />
        <Route path="/sign-in" element={<SignIn></SignIn>} />
        <Route path="/sign-up" element={<SignUp></SignUp>} />
        <Route path="/overview" element={<OverviewPage></OverviewPage>} />
        <Route path="/account-verification/:token/:user_id" element={<AccountVerification></AccountVerification>} />
        <Route path="/user-account" element={<UserAccount></UserAccount>} />
        <Route path="/return/:checkout_session_id" element={<Return></Return>} />
        <Route path="/reset-password" element={<ResetPassword></ResetPassword>} />
        <Route path="/reset-password/:token/:id" element={<ConfirmResetPassword />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
