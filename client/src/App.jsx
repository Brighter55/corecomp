import {BrowserRouter, Routes, Route} from "react-router-dom"
import Homepage from "./Homepage.jsx"
import SignIn from "./SignIn.jsx"
import SignUp from "./SignUp.jsx"
import Overview from "./Overview/Overview.jsx"
import AccountVerification from "./AccountVerification.jsx"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage></Homepage>} />
        <Route path="/sign-in" element={<SignIn></SignIn>} />
        <Route path="/sign-up" element={<SignUp></SignUp>} />
        <Route path="/overview" element={<Overview></Overview>} />
        <Route path="/account-verification/:token/:user_id" element={<AccountVerification></AccountVerification>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
