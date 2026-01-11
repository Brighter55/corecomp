import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
// mui components
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
// helper
import { fetchSymbolDataWithRetry } from "../../helpers/helper.js"


function Hero({ symbol, fetchVersion, setSymbol }) {
    const navigate = useNavigate();
    const [price, setPrice] = useState(null);
    const [name, setName] = useState(null);

    const logoUrl = `https://img.logo.dev/ticker/${symbol}?token=${import.meta.env.VITE_LOGO_DEV_PUBLISHABLE_KEY}&size=450`

    useEffect(() => {
        async function getMostRecentPrice() {
            const payload = {symbol: symbol};
            const response = await fetchSymbolDataWithRetry("http://127.0.0.1:8000/pages/overview/current-price", payload, () => isActive, navigate, setSymbol);
            if (!isActive) {
                return;
            }
            const data = await response.json();
            console.log(data)
            setPrice(data["price"]);
            setName(data["name"]);
        }

        let isActive = true;
        getMostRecentPrice();

        return  () => {
            isActive = false;
        };
    }, [symbol, fetchVersion]);

    return (
        <Stack
            direction="row"
            sx={{ width: "100%", alignItems: "center" }}
            spacing={5}
        >
            <Box
                component="img"
                src={logoUrl}
                sx={{
                    width: {xs: "7rem", sm: "15rem", md: "20rem"},
                    height: {xs: "7rem", sm: "15rem", md: "20rem"},
                    borderRadius: "50%"
                }}
            />
            { price ? (
                <Stack spacing={2}>
                    <Typography
                    sx={{
                        fontSize: { xs: "1rem", sm: "2rem", md: "3rem" },
                        fontWeight: "bold"
                    }}>
                        {symbol.toUpperCase()} | {name}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
                            fontWeight: "bold"
                        }}
                    >
                        {price}
                        <Typography
                            component="span"
                            sx={{
                                fontSize: { xs: "0.5rem", sm: "1rem", md: "2rem" },
                                fontWeight: "bold"
                            }}
                        >
                            USD
                        </Typography>
                    </Typography>
                </Stack>
            ) : (
                <Skeleton variant="rounded" width={600} height={250} />
            )}
        </Stack>
    )
}


export default Hero
