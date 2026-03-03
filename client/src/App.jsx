import {BrowserRouter, Routes, Route} from "react-router-dom"
import AuthenticatedRoute from "./auth/AuthenticatedRoute.jsx"
import AuthorizedRoute from "./auth/AuthorizedRoute.jsx"
import Landing from "./landing-page/Landing.jsx"
import SignIn from "./SignIn.jsx"
import SignUp from "./SignUp.jsx"
import OverviewPage from "./overview/OverviewPage.jsx"
import AccountVerification from "./AccountVerification.jsx"
import Account from "./Account.jsx"
import CheckoutReturn from "./CheckoutReturn.jsx"
import ResetPassword from "./ResetPassword.jsx"
import ConfirmResetPassword from "./ConfirmResetPassword.jsx"
import PrivacyPolicy from "./PrivacyPolicy.jsx"
import TermsOfService from "./TermsOfService.jsx"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing></Landing>} />
        <Route path="/sign-in" element={<SignIn></SignIn>} />
        <Route path="/sign-up" element={<SignUp></SignUp>} />
        <Route path="/overview" element={<AuthenticatedRoute><AuthorizedRoute><OverviewPage /></AuthorizedRoute></AuthenticatedRoute>} />
        <Route path="/privacy-policy" element={<PrivacyPolicy></PrivacyPolicy>} />
        <Route path="/tos" element={<TermsOfService></TermsOfService>} />
        <Route path="/account-verification/:token/:user_id" element={<AccountVerification></AccountVerification>} />
        <Route path="/account" element={<AuthenticatedRoute><Account /></AuthenticatedRoute>} />
        <Route path="/return/:checkout_session_id" element={<AuthenticatedRoute><CheckoutReturn/></AuthenticatedRoute>} />
        <Route path="/reset-password" element={<ResetPassword></ResetPassword>} />
        <Route path="/reset-password/:token/:id" element={<ConfirmResetPassword />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
