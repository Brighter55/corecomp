import styles from "./GraphsCarousel.module.css"
// images
import capitalExpendituresGraph from "../../../assets/Graphs/capitalExpendituresGraph.png"
import cashVsDebtGraph from "../../../assets/Graphs/cashVsDebtGraph.png"
import dividendGraph from "../../../assets/Graphs/dividendGraph.png"
import epsGraph from "../../../assets/Graphs/epsGraph.png"
import freeCashFlowGraph from "../../../assets/Graphs/freeCashFlowGraph.png"
import incomeGraph from "../../../assets/Graphs/capitalExpendituresGraph.png"
import operatingCashFlowGraph from "../../../assets/Graphs/operatingCashFlowGraph.png"
import pricingGraph from "../../../assets/Graphs/pricingGraph.png"
import revenueGraph from "../../../assets/Graphs/revenueGraph.png"
import sharesOutstandingGraph from "../../../assets/Graphs/sharesOutstandingGraph.png"
function GraphsCarousel() {

    return (
        <div className={styles.graphs}>
            <div className={styles.graphsImages}>
                <img src={capitalExpendituresGraph} className={styles.graphImage}/>
                <img src={cashVsDebtGraph} className={styles.graphImage}/>
                <img src={dividendGraph} className={styles.graphImage}/>
                <img src={epsGraph} className={styles.graphImage}/>
                <img src={freeCashFlowGraph} className={styles.graphImage} />
                <img src={incomeGraph} className={styles.graphImage}/>
                <img src={operatingCashFlowGraph} className={styles.graphImage}/>
                <img src={pricingGraph} className={styles.graphImage}/>
                <img src={revenueGraph} className={styles.graphImage}/>
                <img src={sharesOutstandingGraph} className={styles.graphImage}/>
            </div>
            <div className={styles.graphsImages}>
                <img src={capitalExpendituresGraph} className={styles.graphImage}/>
                <img src={cashVsDebtGraph} className={styles.graphImage}/>
                <img src={dividendGraph} className={styles.graphImage}/>
                <img src={epsGraph} className={styles.graphImage}/>
                <img src={freeCashFlowGraph} className={styles.graphImage} />
                <img src={incomeGraph} className={styles.graphImage}/>
                <img src={operatingCashFlowGraph} className={styles.graphImage}/>
                <img src={pricingGraph} className={styles.graphImage}/>
                <img src={revenueGraph} className={styles.graphImage}/>
                <img src={sharesOutstandingGraph} className={styles.graphImage}/>
            </div>
        </div>
    )
}


export default GraphsCarousel
