import {BrowserRouter, Routes, Route} from "react-router-dom"
import AuthenticatedRoute from "./auth/AuthenticatedRoute.jsx"
import Landing from "./landing-page/Landing.tsx"
import Login from "./Login.tsx"
import OverviewPage from "./overview/OverviewPage.tsx"
import SymbolOverviewPage from "./overview/SymbolOverviewPage.tsx"
import Account from "./Account.jsx"
import PrivacyPolicy from "./PrivacyPolicy.jsx"
import TermsOfService from "./TermsOfService.jsx"
import Upcoming from "./Upcoming.jsx"
import MaintenanceBanner from "./components/MaintenanceBanner.tsx"

function App() {
  return (
    <BrowserRouter>
      <MaintenanceBanner />
      <Routes>
        <Route path="/" element={<Landing></Landing>} />
        <Route path="/login" element={<Login />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/overview/:symbol" element={<SymbolOverviewPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy></PrivacyPolicy>} />
        <Route path="/tos" element={<TermsOfService></TermsOfService>} />
        <Route path="/account" element={<AuthenticatedRoute><Account /></AuthenticatedRoute>} />
        <Route path="/upcoming" element={<Upcoming />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
