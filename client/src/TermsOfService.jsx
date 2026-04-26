import LandingHeader from "./headers/LandingHeader.tsx";
import Footer from "./shared/Footer.tsx";


function TermsOfService() {
    return (
        <div className="min-h-screen pb-12">
            <LandingHeader />
            <div className="mx-auto max-w-6xl px-4">
                <div className="space-y-10">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold">Terms of Service</h1>
                            <p className="text-lg text-[var(--text-muted)]">Last updated: 3/2/26</p>
                        </div>
                        <h2 className="text-2xl font-semibold">By using this application, you agree to the following</h2>
                        <div className="space-y-1">
                            <p>You will use the service lawfully</p>
                            <p>The service is provided "as is" with no warranties</p>
                            <p>We may suspend or terminate accounts for misuse</p>
                            <p>We are not liable for damages resulting from use of the service</p>
                        </div>
                        <p>These terms may be updated at any time</p>
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    )
}

export default TermsOfService