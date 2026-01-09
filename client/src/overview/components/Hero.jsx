import { useState, useEffect } from "react"
// mui components
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// pictures
import logo from "../assets/logoPlaceholder.png"


function Hero({ symbol, fetchVersion }) {
    const [price, setPrice] = useState(null);

    useEffect(() => {
        async function getMostRecentPrice() {
            const payload = {symbol: symbol, period: period};
            const response = await fetch("http://127.0.0.1:8000/pages/get-most-recent-price", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("access")}`,
                },
                body: JSON.stringify(payload),
            });

            /*get new tokens if access expires*/
            if (!response.ok) {
                if (response.status === 403) { /*Unauthorized user, aka, don't have permission to use*/
                    navigate("/user-account");
                } else {
                    navigate("/sign-up");
                }
            }
            const data = await response.json();
            console.log(data);
            setPrice(data.price);
        }

        getMostRecentPrice()
    }, [symbol, fetchVersion]);

    return (
        <Stack
            direction="row"
            sx={{ width: "100%", alignItems: "center" }}
            spacing={5}
        >
            <Box
                component="img"
                src={logo}
                sx={{
                    width: {xs: "7rem", sm: "15rem", md: "20rem"},
                    height: {xs: "7rem", sm: "15rem", md: "20rem"},
                    borderRadius: "50%"
                }}
            />
            <Stack spacing={2}>
                <Typography sx={{ fontSize: { xs: "2rem", sm: "3rem", md: "4rem" }, fontWeight: "bold" }}>{symbol}</Typography>
                <Typography sx={{ fontSize: { xs: "2rem", sm: "3rem", md: "4rem" }, fontWeight: "bold" }}>{price} <Typography component="span" sx={{ fontSize: { xs: "1rem", sm: "2rem", md: "3rem" }, fontWeight: "bold" }}>USD</Typography></Typography>
            </Stack>
        </Stack>
    )
}


export default Hero
