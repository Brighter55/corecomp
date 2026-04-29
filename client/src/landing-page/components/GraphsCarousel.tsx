import capitalExpendituresGraph from "../../assets/Graphs/capitalExpendituresGraph.png";
import cashVsDebtGraph from "../../assets/Graphs/cashVsDebtGraph.png";
import dividendGraph from "../../assets/Graphs/dividendGraph.png";
import epsGraph from "../../assets/Graphs/epsGraph.png";
import freeCashFlowGraph from "../../assets/Graphs/freeCashFlowGraph.png";
import incomeGraph from "../../assets/Graphs/capitalExpendituresGraph.png";
import operatingCashFlowGraph from "../../assets/Graphs/operatingCashFlowGraph.png";
import pricingGraph from "../../assets/Graphs/pricingGraph.png";
import revenueGraph from "../../assets/Graphs/revenueGraph.png";
import sharesOutstandingGraph from "../../assets/Graphs/sharesOutstandingGraph.png";

const graphImages = [
  capitalExpendituresGraph,
  cashVsDebtGraph,
  dividendGraph,
  epsGraph,
  freeCashFlowGraph,
  incomeGraph,
  operatingCashFlowGraph,
  pricingGraph,
  revenueGraph,
  sharesOutstandingGraph,
];

function GraphRow() {
  return (
    <div className="inline-flex h-full animate-[slide-left_45s_linear_infinite] items-center">
      {graphImages.map((imageSrc, index) => {
        return (
          <img
            key={`${imageSrc}-${index}`}
            src={imageSrc}
            alt="financial graph"
            className="mx-6 h-full rounded-lg"
          />
        );
      })}
    </div>
  );
}

function GraphsCarousel() {
  return (
    <div className="relative h-full w-full overflow-hidden whitespace-nowrap" role="presentation">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-[10%] bg-gradient-to-l from-transparent to-[var(--surface-main)]" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-[10%] bg-gradient-to-r from-transparent to-[var(--surface-main)]" />
      <div className="group h-full hover:[&_*]:[animation-play-state:paused]">
        <GraphRow />
        <GraphRow />
      </div>
    </div>
  );
}

export default GraphsCarousel;
