import logo from "../assets/logoDarkMode.png"
import { useNavigate } from "react-router-dom";
// mui components
import Stack from '@mui/material/Stack';
import Typography from "@mui/material/Typography";

function Brand({ variant }) {
    const navigate = useNavigate();
    let path;
    if (variant === "landing") {
        path = "/"
    } else if (variant === "product") {
        path = "/overview"
    }


    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", cursor: "pointer" }} onClick={() => {navigate(path)}}>
            <img
                src={logo}
                alt="logo"
                style={{ height: "3rem", width: "3rem", borderRadius: "10px" }}
            />
            <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "var(--main-dust-grey)" }}
            >
                CoreComp
            </Typography>
        </Stack>
    )
}


export default Brand
