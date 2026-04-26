import LandingHeader from "./headers/LandingHeader.tsx";
import Footer from "./shared/Footer.tsx";


function PrivacyPolicy() {
    return (
        <div className="min-h-screen pb-12">
            <LandingHeader />
            <div className="mx-auto max-w-6xl px-4">
                <div className="space-y-10">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold">Privacy Policy</h1>
                            <p className="text-lg text-[var(--text-muted)]">Last updated: 3/2/26</p>
                        </div>
                        <p>This application collects basic user information to provide authentication and core features.</p>
                        <hr className="border-[var(--line-muted)]" />
                        <h2 className="text-2xl font-semibold">Information we collect</h2>
                        <div className="space-y-1">
                            <p>If you sign in using Google, we may collect: email address</p>
                            <p>If you sign in using our registration, we may collect: username, email address, and password (hashed)</p>
                        </div>
                        <hr className="border-[var(--line-muted)]" />
                        <h2 className="text-2xl font-semibold">How we use these informations</h2>
                        <p>These informations are neccessary to create and authenticate user accounts, and provide app functionality</p>
                        <hr className="border-[var(--line-muted)]" />
                        <h2 className="text-2xl font-semibold">Google User Data</h2>
                        <p>Our use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.</p>
                        <hr className="border-[var(--line-muted)]" />
                        <h2 className="text-2xl font-semibold">Data Sharing</h2>
                        <p>We do not sell or share your personal data with third parties.</p>
                        <hr className="border-[var(--line-muted)]" />
                        <h2 className="text-2xl font-semibold">Data Storage & Security</h2>
                        <p>We take reasonable measures to protect user data, but no system is 100% secure.</p>
                        <hr className="border-[var(--line-muted)]" />
                        <h2 className="text-2xl font-semibold">Contact</h2>
                        <p>
                          If you have any concerns, contact us at <a className="font-bold text-[var(--main-brown)]" href="mailto: support@corecomp.cc">support@corecomp.cc</a>
                        </p>
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    )
}

export default PrivacyPolicy