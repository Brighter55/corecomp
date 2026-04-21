import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import LandingHeader from "../headers/LandingHeader.tsx";
import explanationImage from "../assets/explanation.png";
import SampleIncomeGraph from "./components/SampleIncomeGraph.tsx";
import GraphsCarousel from "./components/GraphsCarousel.tsx";
import FAQ from "./components/FAQ.tsx";
import Steps from "./components/Steps.tsx";
import Footer from "../shared/Footer.tsx";
import { Button } from "../components/ui/button";

type FeatureItem = {
  id: number;
  text: string;
  content: ReactNode;
};

function Landing() {
  const navigate = useNavigate();

  const features: FeatureItem[] = [
    {
      id: 0,
      text: "Over 20 years of comprehensive financial data that provides a broad view of any company.",
      content: <SampleIncomeGraph />,
    },
    {
      id: 1,
      text: "10+ fundamentals to help you truly understand a company's performance.",
      content: <GraphsCarousel />,
    },
    {
      id: 2,
      text: "Beginners? Professionals? CoreComp explains everything in simple terms.",
      content: (
        <img
          src={explanationImage}
          alt="explanation sample"
          className="h-full w-full rounded-xl object-cover sm:w-[30rem] md:w-[40rem]"
        />
      ),
    },
  ];

  const [currentPage, setCurrentPage] = useState(0);

  const currentFeature = features[currentPage];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-10">
      <LandingHeader />
      <div className="space-y-20">
        <section id="hero" className="flex justify-center">
          <div className="space-y-5 text-center">
            <h1 className="mx-auto w-full font-display text-4xl font-bold md:w-[60%] md:text-6xl">
              An every Core detail of a Company app
            </h1>
            <div className="mx-auto h-px w-[30%] bg-[var(--line-muted)]" />
            <p className="mx-auto w-[85%] text-[var(--text-muted)] md:w-[50%]">
              Turns complex financial data into simple, easy-to-read graphs with over 20 years of financial history and clear, beginner-friendly explanations.
            </p>
            <Button
              className="mt-2"
              onClick={() => {
                navigate("/sign-up");
              }}
            >
              Get Started
            </Button>
          </div>
        </section>

        <section
          id="features"
          className="flex items-center rounded-2xl bg-[var(--surface-main)] px-2 py-8 shadow-[0_0_10px_2px_rgba(0,0,0,0.4)]"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setCurrentPage((prev) => prev - 1);
            }}
            disabled={currentPage === 0}
            aria-label="Previous feature"
          >
            <ChevronLeft />
          </Button>

          <div className="flex-1 overflow-hidden px-2 md:px-5">
            <div key={currentFeature.id} className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-semibold md:text-3xl">{currentFeature.text}</h2>
              <div className="flex h-[20rem] justify-center md:h-[30rem]">{currentFeature.content}</div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setCurrentPage((prev) => prev + 1);
            }}
            disabled={currentPage >= features.length - 1}
            aria-label="Next feature"
          >
            <ChevronRight />
          </Button>
        </section>

        <section id="steps">
          <Steps />
        </section>

        <section id="pricing">
          <div className="space-y-4 text-center">
            <h2 className="text-4xl font-bold md:text-5xl">No cost (Alpha Test)</h2>
            <p className="mx-auto w-[85%] text-[var(--text-muted)] md:w-[50%]">
              Your money should go to your investments, not tools; this is the most affordable stock analysis app.
            </p>
            <div className="mx-auto mt-10 w-[80%] space-y-4 rounded-[30px] border-4 border-white bg-[var(--card-main)] p-8 text-left text-[var(--card-text)] shadow-[0_0_40px_5px_rgba(255,255,255,0.7)] md:w-[30%]">
              <h3 className="text-2xl font-semibold">Monthly</h3>
              <p>
                <span className="text-6xl font-normal">$0</span>
                <span className="ml-2 text-lg">/ month</span>
              </p>
              <Button
                className="h-12 w-full"
                variant="forest"
                onClick={() => {
                  navigate("/sign-up");
                }}
              >
                Subscribe
              </Button>
              <p>All features</p>
              <div className="h-px w-full bg-black/15" />
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[var(--main-fern)]" />
                <p>Unlimited stock search</p>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[var(--main-fern)]" />
                <p>And many more in the future</p>
              </div>
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
