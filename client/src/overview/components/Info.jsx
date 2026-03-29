import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import AnalystRatings from "./AnalystRatings.jsx"
import BetaChart from "./BetaChart.jsx"
// helper
import { authenticatedClientWithRetry } from "../../helpers/api.js"
// mui
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';
import Link from '@mui/material/Link'
import Box from '@mui/material/Box';

const Profile = styled(Stack)(({ theme }) => ({
    [theme.breakpoints.up("xs")] : {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between"
    },
    [theme.breakpoints.up("md")] : {
        flexDirection: "column",
        width: "20rem",
        justifyContent: "flex-start"
    },
}));

const ProfileInfo = styled(Stack)(({ theme }) => ({
    textAlign: "right",
    maxWidth: "40%",
    [theme.breakpoints.up("md")] : {
        textAlign: "left",
        maxWidth: "none",
    },
}));

const Fact = styled(Box)({
    display: "flex",
    justifyContent: "space-between",
});

function Info({ symbol, fetchVersion, setSymbol }) {
    const navigate = useNavigate();
    const [companyData, setCompanyData] = useState(null);

    useEffect(() => {
        async function getData() {
            const payload = {symbol: symbol};
            const response = await authenticatedClientWithRetry("/pages/info", payload, () => isActive, navigate, setSymbol);
            if (!isActive) {
                return;
            }
            const data = await response.json();
            console.log(data)
            setCompanyData(data);
        }

        let isActive = true;
        getData();

        return  () => {
            isActive = false;
        };
    }, [symbol, fetchVersion]);

    return (
        <Stack spacing={4}>
            <Typography variant="h4">About</Typography>
            <Stack
                direction={{ xs: "column", md: "row" }}
                divider={ <Divider orientation="horizontal" flexItem sx={{ backgroundColor: "#73737391" }}/> }
                sx={{ flexWrap: 'wrap', gap: "2rem"}}
            >
                <Profile>
                    <Typography variant="h6">Sector</Typography>
                    <ProfileInfo variant="body1">
                        {companyData ? companyData.sector : <Skeleton />}
                    </ProfileInfo>
                </Profile>
                <Profile>
                    <Typography variant="h6">Industry</Typography>
                    <ProfileInfo variant="body1">
                        {companyData ? companyData.industry : <Skeleton />}
                    </ProfileInfo>
                </Profile>
                <Profile>
                    <Typography variant="h6">Country</Typography>
                    <ProfileInfo variant="body1">
                        {companyData ? companyData.country : <Skeleton />}
                    </ProfileInfo>
                </Profile>
                <Profile>
                    <Typography variant="h6">Exchange</Typography>
                    <ProfileInfo variant="body1">
                        {companyData ? companyData.exchange : <Skeleton />}
                    </ProfileInfo>
                </Profile>
                <Profile>
                    <Typography variant="h6">Website</Typography>
                    <Link
                        href={companyData ? companyData.website : ""}
                        color="inherit"
                    >
                        <ProfileInfo
                            variant="body1"
                            sx={{
                                "&:hover": {
                                    transform: "translateY(-1px)",
                                },
                            }}
                        >
                            {companyData ? companyData.website : <Skeleton />}
                        </ProfileInfo>
                    </Link>
                </Profile>
                <Profile>
                    <Typography variant="h6">Address</Typography>
                    <ProfileInfo variant="body1">
                        {companyData ? companyData.address : <Skeleton />}
                    </ProfileInfo>
                </Profile>
                <Profile>
                    <Typography variant="h6">Fiscal Year End</Typography>
                    <ProfileInfo variant="body1">
                        {companyData ? companyData.fiscalYearEnd : <Skeleton />}
                    </ProfileInfo>
                </Profile>
            </Stack>
            <Typography variant="body1">
                {companyData ? companyData.description : <Skeleton />}
            </Typography>

            <Stack spacing={5}>
                <Stack spacing={3}>
                    <Typography variant="h5" textAlign="center">Valuation</Typography>
                    <Stack
                        sx={{ width: "100%" }}
                        spacing={2}
                        divider={ <Divider orientation="horizontal" flexItem sx={{ backgroundColor: "#73737391" }}/> }
                    >
                        <Fact>
                            <Typography variant="h6">Market Cap</Typography>
                            <Typography variant="h6">{companyData ? companyData.marketCapitalization : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">SharesOutstanding</Typography>
                            <Typography variant="h6">{companyData ? companyData.sharesOutstanding : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">PE Ratio</Typography>
                            <Typography variant="h6">{companyData ? companyData.peRatio : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">PEG Ratio</Typography>
                            <Typography variant="h6">{companyData ? companyData.pegRatio : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">PriceToSalesRatioTTM</Typography>
                            <Typography variant="h6">{companyData ? companyData.priceToSalesRatioTtm : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">PriceToBookRatio</Typography>
                            <Typography variant="h6">{companyData ? companyData.priceToBookRatio : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">EVToRevenue</Typography>
                            <Typography variant="h6">{companyData ? companyData.evToRevenue : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">EVToEBITDA</Typography>
                            <Typography variant="h6">{companyData ? companyData.evToEbitda : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">Beta</Typography>
                            <Typography variant="h6">{companyData ? companyData.beta : <Skeleton />}</Typography>
                        </Fact>
                    </Stack>
                </Stack>
                <Stack spacing={3}>
                    <Typography variant="h5" textAlign="center">Price & Moving Average</Typography>
                    <Stack
                        sx={{ width: "100%" }}
                        spacing={2}
                        divider={ <Divider orientation="horizontal" flexItem sx={{ backgroundColor: "#73737391" }}/> }
                    >
                        <Fact>
                            <Typography variant="h6">52WeekHigh</Typography>
                            <Typography variant="h6">{companyData ? companyData.fiftyTwoWeekHigh : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">52WeekLow</Typography>
                            <Typography variant="h6">{companyData ? companyData.fiftyTwoWeekLow : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">50DayMovingAverage</Typography>
                            <Typography variant="h6">{companyData ? companyData.fiftyDayMovingAverage : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">200DayMovingAverage</Typography>
                            <Typography variant="h6">{companyData ? companyData.twoHundredDayMovingAverage : <Skeleton />}</Typography>
                        </Fact>
                    </Stack>
                </Stack>
                <Stack spacing={3}>
                    <Typography variant="h5" textAlign="center">Profitability</Typography>
                    <Stack
                        sx={{ width: "100%" }}
                        spacing={2}
                        divider={ <Divider orientation="horizontal" flexItem sx={{ backgroundColor: "#73737391" }}/> }
                    >
                        <Fact>
                            <Typography variant="h6">EBITDA</Typography>
                            <Typography variant="h6">{companyData ? companyData.ebitda : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">DilutedEPSTTM</Typography>
                            <Typography variant="h6">{companyData ? companyData.dilutedEpsTtm : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">Profit Margin</Typography>
                            <Typography variant="h6">{companyData ? companyData.profitMargin : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">OperatingMarginTTM</Typography>
                            <Typography variant="h6">{companyData ? companyData.operatingMarginTtm : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">ReturnOnAssetsTTM</Typography>
                            <Typography variant="h6">{companyData ? companyData.returnOnAssetsTtm : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">ReturnOnEquityTTM</Typography>
                            <Typography variant="h6">{companyData ? companyData.returnOnEquityTtm : <Skeleton />}</Typography>
                        </Fact>
                    </Stack>
                </Stack>
                <Stack spacing={3}>
                    <Typography variant="h5" textAlign="center">Growth</Typography>
                    <Stack
                        sx={{ width: "100%" }}
                        spacing={2}
                        divider={ <Divider orientation="horizontal" flexItem sx={{ backgroundColor: "#73737391" }}/> }
                    >
                        <Fact>
                            <Typography variant="h6">QuarterlyEarningsGrowthYOY</Typography>
                            <Typography variant="h6">{companyData ? companyData.quarterlyEarningsGrowthYoy : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">QuarterlyRevenueGrowthYOY</Typography>
                            <Typography variant="h6">{companyData ? companyData.quarterlyRevenueGrowthYoy : <Skeleton />}</Typography>
                        </Fact>
                    </Stack>
                </Stack>
                <Stack spacing={3}>
                    <Typography variant="h5" textAlign="center">Profit</Typography>
                    <Stack
                        sx={{ width: "100%" }}
                        spacing={2}
                        divider={ <Divider orientation="horizontal" flexItem sx={{ backgroundColor: "#73737391" }}/> }
                    >
                        <Fact>
                            <Typography variant="h6">RevenueTTM</Typography>
                            <Typography variant="h6">{companyData ? companyData.revenueTtm : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">GrossProfitTTM</Typography>
                            <Typography variant="h6">{companyData ? companyData.grossProfitTtm : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">RevenuePerShareTTM</Typography>
                            <Typography variant="h6">{companyData ? companyData.revenuePerShareTtm : <Skeleton />}</Typography>
                        </Fact>
                    </Stack>
                </Stack>
                <Stack spacing={3}>
                    <Typography variant="h5" textAlign="center">Dividends</Typography>
                    <Stack
                        sx={{ width: "100%" }}
                        spacing={2}
                        divider={ <Divider orientation="horizontal" flexItem sx={{ backgroundColor: "#73737391" }}/> }
                    >
                        <Fact>
                            <Typography variant="h6">DividendPerShare</Typography>
                            <Typography variant="h6">{companyData ? companyData.dividendPerShare : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">DividendYield</Typography>
                            <Typography variant="h6">{companyData ? companyData.dividendYield : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">DividendDate</Typography>
                            <Typography variant="h6">{companyData ? companyData.dividendDate : <Skeleton />}</Typography>
                        </Fact>
                        <Fact>
                            <Typography variant="h6">ExDividendDate</Typography>
                            <Typography variant="h6">{companyData ? companyData.exDividendDate : <Skeleton />}</Typography>
                        </Fact>
                    </Stack>
                </Stack>

                {companyData ?
                    <AnalystRatings
                        analystTargetPrice={companyData.analystTargetPrice}
                        analystRatingStrongBuy={companyData.analystRatingStrongBuy}
                        analystRatingBuy={companyData.analystRatingBuy}
                        analystRatingHold={companyData.analystRatingHold}
                        analystRatingSell={companyData.analystRatingSell}
                        analystRatingStrongSell={companyData.analystRatingStrongSell}
                    />
                :
                    <Skeleton variant="rounded" height={200} />
                }

                {companyData ? 
                    <BetaChart beta={companyData.beta}/>
                :
                    <Skeleton variant="rounded" height={200} />
                }
            </Stack>
        </Stack>
    )
}

export default Info
