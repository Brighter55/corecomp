import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
// helper
import { fetchSymbolDataWithRetry } from "../../helpers/helper.js"
// mui
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';
import Link from '@mui/material/Link'


const Info = styled(Stack)({
    flex: 1,
    minWidth: "15rem",
    gap: ".5rem",
});

function About({ symbol, fetchVersion, setSymbol }) {
    const navigate = useNavigate();
    const [sector, setSector] = useState(null);
    const [industry, setIndustry] = useState(null);
    const [country, setCountry] = useState(null);
    const [exchange, setExchange] =  useState(null);
    const [website, setWebsite] = useState(null);
    const [address, setAddress] =  useState(null);
    const [fiscalYearEnd, setFiscalYearEnd] =  useState(null);
    const [description, setDescription] = useState(null);

    useEffect(() => {
        async function getData() {
            const payload = {symbol: symbol};
            const response = await fetchSymbolDataWithRetry("http://127.0.0.1:8000/pages/overview/info", payload, () => isActive, navigate, setSymbol);
            if (!isActive) {
                return;
            }
            const data = await response.json();
            console.log(data)
            setSector(data["sector"]);
            setIndustry(data["industry"]);
            setCountry(data["country"]);
            setExchange(data["exchange"]);
            setWebsite(data["website"]);
            setAddress(data["address"]);
            setFiscalYearEnd(data["fiscalYearEnd"]);
            setDescription(data["description"]);
        }

        let isActive = true;
        getData();

        return  () => {
            isActive = false;
        };
    }, [symbol, fetchVersion]);

    return (
        <Stack spacing={2}>
            <Typography variant="h4">About</Typography>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                gap={4}
                divider={ <Divider orientation="horizontal" flexItem sx={{ backgroundColor: "white" }}/> }
                sx={{ flexWrap: 'wrap'}}
            >
                <Info>
                    <Typography variant="h6">Sector</Typography>
                    <Typography variant="body1">
                        {sector ? sector : <Skeleton />}
                    </Typography>
                </Info>
                <Info>
                    <Typography variant="h6">Industry</Typography>
                    <Typography variant="body1">
                        {industry ? industry : <Skeleton />}
                    </Typography>
                </Info>
                <Info>
                    <Typography variant="h6">Country</Typography>
                    <Typography variant="body1">
                        {country ? country : <Skeleton />}
                    </Typography>
                </Info>
                <Info>
                    <Typography variant="h6">Exchange</Typography>
                    <Typography variant="body1">
                        {exchange ? exchange : <Skeleton />}
                    </Typography>
                </Info>
                <Info>
                    <Typography variant="h6">Website</Typography>
                    <Link
                        href={website ? website : ""}
                        color="inherit"
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                "&:hover": {
                                    transform: "translateY(-1px)",
                                },
                            }}
                        >
                            {website ? website : <Skeleton />}
                        </Typography>
                    </Link>
                </Info>
                <Info>
                    <Typography variant="h6">Address</Typography>
                    <Typography variant="body1">
                        {address ? address : <Skeleton />}
                    </Typography>
                </Info>
                <Info>
                    <Typography variant="h6">Fiscal Year End</Typography>
                    <Typography variant="body1">
                        {fiscalYearEnd ? fiscalYearEnd : <Skeleton />}
                    </Typography>
                </Info>
            </Stack>
            <Typography variant="body1">
                {description ? description : <Skeleton />}
            </Typography>
        </Stack>
    )
}

export default About
