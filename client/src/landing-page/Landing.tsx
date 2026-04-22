import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import LandingHeader from "../headers/LandingHeader.tsx";
import FAQ from "./components/FAQ.tsx";
import Footer from "../shared/Footer.tsx";
import { Button } from "../components/ui/button";

function Landing() {
  const navigate = useNavigate();

  return (
    <main className="pb-10">
      <section className="overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <LandingHeader />
        <section id="hero" className="mx-auto flex min-h-[34rem] max-w-6xl items-center justify-center px-4 pb-10 pt-15 md:min-h-[42rem]">
          <div className="space-y-8 text-center">
            <h1 className="mx-auto w-full font-display text-4xl font-bold tracking-[-0.03em] md:w-[72%] md:text-6xl">
              An &ldquo;every Core detail of a Company&rdquo; app
            </h1>
            <p className="mx-auto w-[90%] text-xl leading-relaxed text-[var(--text-muted)] md:w-[62%]">
              Turns complex financial data into simple, easy-looking graphs with over 20+ years of financial data and clear, beginner-friendly explanations.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
              <Button
                className="h-14 min-w-36 rounded-2xl border-2 border-[var(--line-muted)] bg-white/20 px-8 text-xl font-bold text-[var(--text-main)] transition-all hover:border-white hover:bg-white/30"
                onClick={() => {
                  navigate("/sign-in");
                }}
              >
                Try out!
              </Button>
              <Button
                className="h-14 min-w-36 rounded-2xl bg-transparent text-lg text-[var(--text-main)] shadow-[0_16px_30px_rgba(0,0,0,0.22)]"
                onClick={() => {
                  navigate("/sign-up");
                }}
              >
                Sign up
              </Button>
            </div>
          </div>
        </section>
      </section>

      <div className="mx-auto mt-3 max-w-6xl space-y-20 px-4">

        <section id="pricing">
          <div className="space-y-5 text-center">
            <h2 className="text-4xl font-bold md:text-5xl">Pick a plan</h2>
            <p className="mx-auto w-[85%] text-[var(--text-muted)] md:w-[50%]">
              By far the most affordable stock analysis app
            </p>
            <div className="mx-auto !mt-20 w-[80%] max-w-sm rounded-[28px] border border-white/10 bg-white/5 p-8 text-left text-[var(--text-main)] shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">Basic</p>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-5xl font-semibold">$7</span>
                <span className="text-sm text-[var(--text-muted)]">/ month</span>
              </div>
              <div className="mt-6 space-y-3 text-sm text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[var(--text-muted)]" />
                  <p>Unlimited stock search</p>
                </div>
                <div className="flex items-center gap-2 !mb-20">
                  <Check className="h-4 w-4 text-[var(--text-muted)]" />
                  <p>and many more in the futures</p>
                </div>
              </div>
              <Button
                className="mt-6 h-12 w-full rounded-xl border border-[var(--surface-soft)] bg-white/10 text-[var(--text-main)] hover:bg-white/15"
                onClick={() => {
                  navigate("/sign-up");
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        </section>

        <section id="FAQ" className="space-y-3">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          <FAQ />
        </section>

        <Footer />
      </div>
    </main>
  );
}

export default Landing;
