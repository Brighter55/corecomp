import {BrowserRouter, Routes, Route} from "react-router-dom"
import Homepage from "./Homepage.jsx"
import SignIn from "./SignIn.jsx"
import SignUp from "./SignUp.jsx"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage></Homepage>} />
        <Route path="/sign-in" element={<SignIn></SignIn>} />
        <Route path="/sign-up" element={<SignUp></SignUp>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
