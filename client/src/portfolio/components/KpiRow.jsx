import { formatMoney, signedMoney } from "../analysisView.js";
import {
  InfoButton,
  KpiIncomeIcon,
  KpiIrrIcon,
  KpiProfitIcon,
  KpiValueIcon,
  TriDownIcon,
  TriUpIcon,
} from "./Common.jsx";

function percent(value) {
  if (value === null || value === undefined) return "—";
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) + "%" : "—";
}

export default function KpiRow({ kpis, onInfo }) {
  const positiveDay = (kpis.todayChange || 0) >= 0;

  return (
    <section className="kpi-row" aria-label="Portfolio at a glance">
      <article className="kpi" aria-label="Value">
        <div className="kpi-top">
          <span className="kpi-icon kpi-icon-value" aria-hidden="true"><KpiValueIcon /></span>
          <p className="kpi-label">Value</p>
          <InfoButton label="About portfolio value" onClick={() => onInfo("value")} />
        </div>
        <p className="kpi-value">{formatMoney(kpis.value)}</p>
        <p className="kpi-sub">{formatMoney(kpis.invested)} invested</p>
      </article>

      <article className="kpi" aria-label="Total profit">
        <div className="kpi-top">
          <span className="kpi-icon kpi-icon-profit" aria-hidden="true"><KpiProfitIcon /></span>
          <p className="kpi-label">Total profit</p>
          <InfoButton label="About total profit" onClick={() => onInfo("profit")} />
        </div>
        <div className="kpi-value-row">
          <p className={"kpi-value " + ((kpis.profit || 0) >= 0 ? "gain" : "loss")}>
            {signedMoney(kpis.profit)}
          </p>
          <span className={"kpi-badge " + ((kpis.returnPct || 0) >= 0 ? "gain" : "loss")}>
            {(kpis.returnPct || 0) >= 0 ? <TriUpIcon /> : <TriDownIcon />}
            <span>{percent(kpis.returnPct)}</span>
          </span>
        </div>
        <p className="kpi-sub">
          <span className={positiveDay ? "gain" : "loss"}>
            {positiveDay ? <TriUpIcon /> : <TriDownIcon />}
            {signedMoney(kpis.todayChange)} ({percent(kpis.todayPct).replace("+", "")}) today
          </span>
        </p>
      </article>

      <article className="kpi" aria-label="Internal rate of return">
        <div className="kpi-top">
          <span className="kpi-icon kpi-icon-irr" aria-hidden="true"><KpiIrrIcon /></span>
          <p className="kpi-label">IRR</p>
          <InfoButton label="About IRR" onClick={() => onInfo("irr")} />
        </div>
        <p className="kpi-value">{percent(kpis.irr)}</p>
        <p className="kpi-sub">
          <span className="kpi-sub-strong">{percent(kpis.holdingsReturn)}</span> current holdings
        </p>
      </article>

      <article className="kpi" aria-label="Passive income">
        <div className="kpi-top">
          <span className="kpi-icon kpi-icon-income" aria-hidden="true"><KpiIncomeIcon /></span>
          <p className="kpi-label">Passive income</p>
          <InfoButton label="About passive income" onClick={() => onInfo("passive")} />
        </div>
        <div className="kpi-value-row">
          <p className="kpi-value">{percent(kpis.incomePct)}</p>
          {Number.isFinite(Number(kpis.incomeGrowth)) ? (
            <span className={"kpi-badge " + (kpis.incomeGrowth >= 0 ? "gain" : "loss")}>
              {kpis.incomeGrowth >= 0 ? <TriUpIcon /> : <TriDownIcon />}
              <span>{Math.abs(kpis.incomeGrowth).toFixed(0)}%</span>
            </span>
          ) : null}
        </div>
        <p className="kpi-sub">
          <span className="kpi-sub-strong">{formatMoney(kpis.annualIncome)}</span> annually
        </p>
      </article>
    </section>
  );
}
