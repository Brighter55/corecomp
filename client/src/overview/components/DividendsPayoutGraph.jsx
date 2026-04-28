import { useState, useMemo } from "react";
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GraphCard from "./GraphCard.jsx"
import GraphTitle from "./GraphTitle.jsx"
import NoDataGraph from "./NoDataGraph.jsx"
import {filterReports, getPercentChange} from "../../helpers/GraphsHelper.js"
//mui
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const explanation = (
    <Stack spacing={2}>
        <Typography variant="explanationTopic">What is it?</Typography>
        <Typography variant="explanationText">
            A dividend payout is the distribution of a portion of a company's earnings to its shareholders. Companies use dividends to reward investors, typically in cash, on a quarterly basis, though some pay monthly or annually. The amount received by a shareholder depends on the number of shares owned and the dividend declared per share.
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="row" spacing={1}>
            <TrendingUpIcon
                sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                A steady or increasing DPS suggests a company is generating strong profits and has the cash flow to distribute to its shareholders.
            </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
            <TrendingDownIcon
                sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
            />
            <Typography variant="explanationText">
                A lower DPS might mean the company is prioritizing reinvesting its earnings back into the business to fuel future growth
            </Typography>
        </Stack>
        <Typography variant="explanationText">
            A history of consistent or growing DPS can indicate a reliable income source.
        </Typography>
        <Typography variant="explanationText">
            A significant reduction or elimination of dividends can be a warning sign to financial hardship, declining profits, or a change in management's priorities.
        </Typography>
    </Stack>
)

function DividendsPayoutGraph({ statement, period }) {
    const [timeRange, setTimeRange] = useState("all");
    const [graphClicked, setGraphClicked] = useState(false);

    const reports = useMemo(() => {
        if (!statement) return [];
        if (Array.isArray(statement) && statement.length === 0) return [];

        return filterReports(statement["data"] ?? [], timeRange, "ex_dividend_date");
    }, [statement, timeRange, period]);

    const percentChange = useMemo(() => {
        if (reports.length === 0) {
            return NaN;
        }
        const percentChange = getPercentChange(reports, "amount");
        return percentChange;
    }, [reports]);


    if (statement === null) {
        return (
            <div className="flex-1">
                <div className="h-80 w-full min-w-[21rem] animate-pulse rounded-[10px] bg-[rgba(163,177,138,0.25)] sm:h-[25rem]" />
            </div>
        );
    }
    if (Array.isArray(statement) && statement.length === 0) {
        return <NoDataGraph />;
    }

    return (
        <div className="flex-1">
            <GraphCard graphClicked={graphClicked}>
                <GraphTitle
                    title="Dividend Payouts"
                    explanation={explanation}
                    percentChange={percentChange}
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                    graphClicked={graphClicked}
                    setGraphClicked={setGraphClicked}
                />
                <div onClick={() => {setGraphClicked(true);}} className="min-h-0 w-full flex-1">
                    <ResponsiveContainer>
                        <BarChart
                            data={reports}
                            margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="" vertical={false} stroke="var(--main-dry-sage)" />
                            <XAxis dataKey="ex_dividend_date" interval="equidistantPreserveStart" stroke="var(--text-main)" tick={{fontSize: 12}}/>
                            <YAxis stroke="var(--text-main)" tickFormatter={(value) => `$${value}`}/>
                            <Tooltip formatter={(value) => `$${value}`}/>
                            <Bar dataKey="amount" fill="#588157" activeBar={<Rectangle fill="#A3B18A"/>}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </GraphCard>
        </div>
    )
}

export default DividendsPayoutGraph
