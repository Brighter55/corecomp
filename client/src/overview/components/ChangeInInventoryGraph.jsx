import GeneralBarGraph from "./GeneralBarGraph.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

const explanation = (
    <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--text-main)]">What is it?</p>
        <p className="text-sm text-[var(--text-main)]">
            Change in inventory measures how much inventory (unsold goods) increased or decreased during the period. It reflects how well the company is managing supply relative to demand.
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Calculation</p>
        <p className="text-sm font-mono text-[var(--text-main)]">
            Change in Inventory = Ending Inventory – Beginning Inventory
        </p>
        <p className="text-sm font-bold text-[var(--text-main)]">Interpretation</p>
        <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 w-10 rounded-md text-green-600" />
            <p className="text-sm text-[var(--text-main)]">
                Rising inventory can mean the company expects higher demand in the future (preparing stock). However, if sales are not increasing, it may signal weak demand and unsold products building up.
            </p>
        </div>
        <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 w-10 rounded-md text-red-600" />
            <p className="text-sm text-[var(--text-main)]">
                Falling inventory usually means strong sales or better inventory management. But if inventory drops too much, the company might not be able to meet demand, leading to lost sales.
            </p>
        </div>
    </div>
)

function ChangeInInventoryGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Change in Inventory"
            barName="Change in Inventory"
            dataKey="changeInInventory"
            explanation={explanation}
        />
    );
}

export default ChangeInInventoryGraph
