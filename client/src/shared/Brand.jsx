import logo from "../assets/logoDarkMode.png"
// mui components
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';

function Brand({ variant }) {
    let href;
    if (variant === "landing") {
        href = "/"
    } else if (variant === "product") {
        href = "/overview"
    }


    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <img
                src={logo}
                alt="logo"
                style={{ height: "3rem", width: "3rem", borderRadius: "10px" }}
            />
            <Link href={href}
                variant="h4"
                underline="none"
                sx={{ fontWeight: "bold", color: "var(--main-dust-grey)" }}
            >
                CoreComp
            </Link>
        </Stack>
    )
}


export default Brand
