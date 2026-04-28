import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { filterReports, formatToUnits } from "../../helpers/GraphsHelper.js";
import GraphCard from "./GraphCard.jsx";
import NoDataGraph from "./NoDataGraph.jsx";
import Explanation from "./Explanation.jsx";
import TimeRanges from "./TimeRanges.jsx";
// mui
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const explanation = (
    <Stack spacing={2}>
        <Typography variant="explanationTopic">What is it?</Typography>
        <Typography variant="explanationText">
            Cash Flow Trifecta combines operating, investing, and financing cash flows into one view so you can compare the full cash picture for each period.
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack spacing={2}>
            <Stack spacing={1}>
                <Typography variant="h6">Startup / Growth Stage</Typography>
                <List sx={{ py: 0, pl: 2 }}>
                    <ListItem sx={{ py: 0.5, display: 'list-item', pl: 0 }}>
                        <Stack direction="row" sx={{ alignItems: 'flex-start', width: '100%' }}>
                            <TrendingDownIcon sx={{ color: "#bc4749", bgcolor: "white", borderRadius: "10px", p: 0.5, mr: 1, flexShrink: 0 }} />
                            <ListItemText 
                                primary="OCF: Negative/low"
                                secondary="Not profitable yet, high expenses"
                                secondaryTypographyProps={{ variant: 'explanationText', color: "white", fontWeight: "normal" }}
                            />
                        </Stack>
                    </ListItem>
                    <ListItem sx={{ py: 0.5, display: 'list-item', pl: 0 }}>
                        <Stack direction="row" sx={{ alignItems: 'flex-start', width: '100%' }}>
                            <TrendingDownIcon sx={{ color: "#bc4749", bgcolor: "white", borderRadius: "10px", p: 0.5, mr: 1, flexShrink: 0 }} />
                            <ListItemText 
                                primary="ICF: Strongly negative"
                                secondary="Heavy investment for growth"
                                secondaryTypographyProps={{ variant: 'explanationText', color: "white", fontWeight: "normal" }}
                            />
                        </Stack>
                    </ListItem>
                    <ListItem sx={{ py: 0.5, display: 'list-item', pl: 0 }}>
                        <Stack direction="row" sx={{ alignItems: 'flex-start', width: '100%' }}>
                            <TrendingUpIcon sx={{ color: "#588157", bgcolor: "white", borderRadius: "10px", p: 0.5, mr: 1, flexShrink: 0 }} />
                            <ListItemText 
                                primary="CFF: Strongly positive"
                                secondary="Raising cash (debt/equity) to fund losses"
                                secondaryTypographyProps={{ variant: 'explanationText', color: "white", fontWeight: "normal" }}
                            />
                        </Stack>
                    </ListItem>
                </List>
            </Stack>

            <Stack spacing={1}>
                <Typography variant="h6">Mature Stage</Typography>
                <List sx={{ py: 0, pl: 2 }}>
                    <ListItem sx={{ py: 0.5, display: 'list-item', pl: 0 }}>
                        <Stack direction="row" sx={{ alignItems: 'flex-start', width: '100%' }}>
                            <TrendingUpIcon sx={{ color: "#588157", bgcolor: "white", borderRadius: "10px", p: 0.5, mr: 1, flexShrink: 0 }} />
                            <ListItemText 
                                primary="OCF: Strong positive"
                                secondary="Stable, cash-generating business"
                                secondaryTypographyProps={{ variant: 'explanationText', color: "white", fontWeight: "normal" }}
                            />
                        </Stack>
                    </ListItem>
                    <ListItem sx={{ py: 0.5, display: 'list-item', pl: 0 }}>
                        <Stack direction="row" sx={{ alignItems: 'flex-start', width: '100%' }}>
                            <TrendingDownIcon sx={{ color: "#bc4749", bgcolor: "white", borderRadius: "10px", p: 0.5, mr: 1, flexShrink: 0 }} />
                            <ListItemText 
                                primary="ICF: Moderately negative"
                                secondary="Maintenance + small investments"
                                secondaryTypographyProps={{ variant: 'explanationText', color: "white", fontWeight: "normal" }}
                            />
                        </Stack>
                    </ListItem>
                    <ListItem sx={{ py: 0.5, display: 'list-item', pl: 0 }}>
                        <Stack direction="row" sx={{ alignItems: 'flex-start', width: '100%' }}>
                            <TrendingDownIcon sx={{ color: "#bc4749", bgcolor: "white", borderRadius: "10px", p: 0.5, mr: 1, flexShrink: 0 }} />
                            <ListItemText 
                                primary="CFF: Negative"
                                secondary="Returning cash (dividends, buybacks, debt repayment)"
                                secondaryTypographyProps={{ variant: 'explanationText', color: "white", fontWeight: "normal" }}
                            />
                        </Stack>
                    </ListItem>
                </List>
            </Stack>

            <Stack spacing={1}>
                <Typography variant="h6">Declining Stage</Typography>
                <List sx={{ py: 0, pl: 2 }}>
                    <ListItem sx={{ py: 0.5, display: 'list-item', pl: 0 }}>
                        <Stack direction="row" sx={{ alignItems: 'flex-start', width: '100%' }}>
                            <TrendingDownIcon sx={{ color: "#bc4749", bgcolor: "white", borderRadius: "10px", p: 0.5, mr: 1, flexShrink: 0 }} />
                            <ListItemText 
                                primary="OCF: Weak/negative"
                                secondary="Shrinking business"
                                secondaryTypographyProps={{ variant: 'explanationText', color: "white", fontWeight: "normal" }}
                            />
                        </Stack>
                    </ListItem>
                    <ListItem sx={{ py: 0.5, display: 'list-item', pl: 0 }}>
                        <Stack direction="row" sx={{ alignItems: 'flex-start', width: '100%' }}>
                            <TrendingUpIcon sx={{ color: "#588157", bgcolor: "white", borderRadius: "10px", p: 0.5, mr: 1, flexShrink: 0 }} />
                            <ListItemText 
                                primary="ICF: Positive"
                                secondary="Selling assets"
                                secondaryTypographyProps={{ variant: 'explanationText', color: "white", fontWeight: "normal" }}
                            />
                        </Stack>
                    </ListItem>
                    <ListItem sx={{ py: 0.5, display: 'list-item', pl: 0 }}>
                        <Stack direction="row" sx={{ alignItems: 'flex-start', width: '100%' }}>
                            <TrendingDownIcon sx={{ color: "#bc4749", bgcolor: "white", borderRadius: "10px", p: 0.5, mr: 1, flexShrink: 0 }} />
                            <ListItemText 
                                primary="CFF: Mixed"
                                secondary="Raising cash to survive or paying down remaining obligations"
                                secondaryTypographyProps={{ variant: 'explanationText', color: "white", fontWeight: "normal" }}
                            />
                        </Stack>
                    </ListItem>
                </List>
            </Stack>
        </Stack>
    </Stack>
);

function CashFlowTrifectaGraph({ statement, period }) {
    const [timeRange, setTimeRange] = useState("all");
    const [graphClicked, setGraphClicked] = useState(false);

    const reports = useMemo(() => {
        if (!statement) return [];
        if (Array.isArray(statement) && statement.length === 0) return [];

        return filterReports(
            statement[period === "annually" ? "annualReports" : "quarterlyReports"] ?? [],
            timeRange,
            "fiscalDateEnding",
        );
    }, [statement, timeRange, period]);

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
                <div className="flex flex-wrap items-center gap-3 px-2 pt-2 sm:flex-nowrap">
                    <div className="flex min-w-0 flex-1 items-center justify-center gap-2 text-center">
                        <h3 className="text-lg font-semibold text-[var(--text-main)]">Cash Flow Trifecta</h3>
                        <Explanation explanation={explanation} />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <TimeRanges timeRange={timeRange} setTimeRange={setTimeRange} />
                        {graphClicked && (
                            <button
                                type="button"
                                aria-label="Close graph"
                                onClick={() => setGraphClicked(false)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-main)] transition-colors hover:bg-[var(--main-brick)]"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
                <div onClick={() => { setGraphClicked(true); }} className="min-h-0 w-full flex-1">
                    <ResponsiveContainer>
                        <LineChart
                            data={reports}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="" vertical={false} stroke="var(--main-dry-sage)" />
                            <XAxis dataKey="fiscalDateEnding" interval="equidistantPreserveStart" stroke="var(--text-main)" tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={(value) => formatToUnits(value)} stroke="var(--text-main)" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]} />
                            <Tooltip formatter={(value) => formatToUnits(value)} />
                            <Legend />
                            <ReferenceLine y={0} stroke="var(--text-main)" strokeWidth={2} strokeDasharray="3 3" />
                            <Line name="Operating Cash Flow" dataKey="operatingCashflow" stroke="#3A5A40" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} type="monotone" />
                            <Line name="Cashflow from Investment" dataKey="cashflowFromInvestment" stroke="#588157" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} type="monotone" />
                            <Line name="Cashflow from Financing" dataKey="cashflowFromFinancing" stroke="#bc4749" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} type="monotone" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </GraphCard>
        </div>
    );
}

export default CashFlowTrifectaGraph;