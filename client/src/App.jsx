import {BrowserRouter, Routes, Route} from "react-router-dom"
import Homepage from "./Homepage.jsx"
import SignIn from "./SignIn.jsx"
import SignUp from "./SignUp.jsx"
import Overview from "./Overview/Overview.jsx"
import AccountVerification from "./AccountVerification.jsx"
import UserAccount from "./UserAccount.jsx"
import Return from "./Return.jsx"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage></Homepage>} />
        <Route path="/sign-in" element={<SignIn></SignIn>} />
        <Route path="/sign-up" element={<SignUp></SignUp>} />
        <Route path="/overview" element={<Overview></Overview>} />
        <Route path="/account-verification/:token/:user_id" element={<AccountVerification></AccountVerification>} />
        <Route path="/user-account" element={<UserAccount></UserAccount>} />
        <Route path="/return/:checkout_session_id" element={<Return></Return>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
