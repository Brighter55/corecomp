import { useMemo, useState, type ReactNode } from "react";
import { ArrowRight, BarChart3, RotateCcw, UserRound, WalletCards } from "lucide-react";
import { Button } from "../../components/ui/button";
import signUpImage from "../../assets/signUp.png";
import subscribeImage from "../../assets/subscribe.png";
import researchImage from "../../assets/research.png";

type StepItem = {
  label: string;
  description: string;
  image: string;
  icon: ReactNode;
};

const steps: StepItem[] = [
  {
    label: "1. Create Account",
    description: "Create an account to get started.",
    image: signUpImage,
    icon: <UserRound className="h-5 w-5" />,
  },
  {
    label: "2. Subscribe",
    description: "Activate your free trial.",
    image: subscribeImage,
    icon: <WalletCards className="h-5 w-5" />,
  },
  {
    label: "3. Research",
    description: "Enter stock symbols and learn the company story through fundamentals.",
    image: researchImage,
    icon: <BarChart3 className="h-5 w-5" />,
  },
];

export default function Steps() {
  const [activeStep, setActiveStep] = useState(0);

  const isComplete = activeStep === steps.length;

  const currentStep = useMemo(() => {
    return steps[Math.min(activeStep, steps.length - 1)];
  }, [activeStep]);

  return (
    <section className="space-y-6">
      <h2 className="text-center text-4xl font-bold">Stock Analysis in 3 Steps</h2>

      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {steps.map((step, index) => {
          const isActive = activeStep === index;
          const isDone = activeStep > index;

          return (
            <div key={step.label} className="space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm ${
                    isActive || isDone
                      ? "border-[var(--main-fern)] bg-[var(--main-fern)] text-[var(--main-dust-grey)]"
                      : "border-[var(--line-muted)] bg-transparent text-[var(--text-muted)]"
                  }`}
                >
                  {step.icon}
                </div>
                <div className={`h-1 flex-1 rounded ${isDone ? "bg-[var(--main-dry-sage)]" : "bg-[var(--line-muted)]"}`} />
              </div>
              <p className={`text-sm md:text-lg ${isActive ? "text-[var(--text-main)]" : "text-[var(--text-muted)]"}`}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <img
          key={currentStep.label}
          src={currentStep.image}
          alt={currentStep.label}
          className="h-52 w-full animate-fade-in rounded-3xl object-cover shadow-[0_0_20px_2px_rgba(0,0,0,0.35)] sm:h-80 md:h-[30rem]"
        />
        {isComplete ? (
          <div className="space-y-3 text-center">
            <h3 className="text-3xl font-semibold">All steps completed</h3>
            <p className="text-[var(--text-muted)]">CoreComp is ready to serve.</p>
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setActiveStep(0);
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Start Over
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-center">
            <h3 className="text-3xl font-semibold">{currentStep.label}</h3>
            <p className="text-[var(--text-muted)]">{currentStep.description}</p>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                disabled={activeStep === 0}
                onClick={() => {
                  setActiveStep((prev) => prev - 1);
                }}
              >
                Back
              </Button>
              <Button
                variant="forest"
                onClick={() => {
                  setActiveStep((prev) => prev + 1);
                }}
              >
                {activeStep === steps.length - 1 ? "Complete" : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
