import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { useState, useEffect, useRef, useMemo } from "react";
import { filterReports, formatToUnits } from "../../helpers/GraphsHelper.js";
import GraphCard from "./GraphCard.jsx";
import NoDataGraph from "./NoDataGraph.jsx";
import Explanation from "./Explanation.jsx";
import TimeRanges from "./TimeRanges.jsx";
// mui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
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

    const graphRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (graphRef.current && !graphRef.current.contains(event.target)) {
                setGraphClicked(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const reports = useMemo(() => {
        if (!statement) return [];
        if (Array.isArray(statement) && statement.length === 0) return [];

        return filterReports(
            statement[period === "annually" ? "annualReports" : "quarterlyReports"],
            timeRange,
            "fiscalDateEnding",
        );
    }, [statement, timeRange, period]);

    if (statement === null) {
        return <Skeleton variant="rounded" sx={{ flex: 1, height: "20rem" }} />;
    }
    if (Array.isArray(statement) && statement.length === 0) {
        return <NoDataGraph />;
    }

    return (
        <Box sx={{ flex: 1 }}>
            <GraphCard ref={graphRef} graphClicked={graphClicked}>
                <Stack direction="row" sx={{ alignItems: "center" }}>
                    <Stack
                        direction="row"
                        sx={{ alignItems: "center", flexGrow: 1, justifyContent: "center" }}
                        spacing={1}
                    >
                        <Typography variant="h6" textAlign="center">Cash Flow Trifecta</Typography>
                        <Explanation explanation={explanation} />
                    </Stack>
                    <TimeRanges timeRange={timeRange} setTimeRange={setTimeRange} />
                </Stack>
                <Box onClick={() => { setGraphClicked(true); }} sx={{ width: "100%", height: "100%" }}>
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
                            <CartesianGrid strokeDasharray="" vertical={false} stroke="#A3B18A" />
                            <XAxis dataKey="fiscalDateEnding" interval="equidistantPreserveStart" stroke="#344E41" tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={(value) => formatToUnits(value)} stroke="#344E41" domain={[dataMin => dataMin * 0.95, dataMax => dataMax * 1.05]} />
                            <Tooltip formatter={(value) => formatToUnits(value)} />
                            <Legend />
                            <ReferenceLine y={0} stroke="#344E41" strokeWidth={2} strokeDasharray="3 3" />
                            <Line name="Operating Cash Flow" dataKey="operatingCashflow" stroke="#3A5A40" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} type="monotone" />
                            <Line name="Cashflow from Investment" dataKey="cashflowFromInvestment" stroke="#588157" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} type="monotone" />
                            <Line name="Cashflow from Financing" dataKey="cashflowFromFinancing" stroke="#bc4749" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} type="monotone" />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </GraphCard>
        </Box>
    );
}

export default CashFlowTrifectaGraph;