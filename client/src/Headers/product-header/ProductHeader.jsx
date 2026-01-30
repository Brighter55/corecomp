import { useNavigate } from 'react-router-dom';
import { useState } from "react"
import { useAuth } from "../../auth/AuthProvider.jsx"
// components
import Features from "./components/Features.jsx"
import Brand from "../../shared/Brand.jsx";
import HideOnScroll from "../components/HideOnScroll.jsx"
// mui components
import Button from '@mui/material/Button';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
// images
import logo from "../../assets/logoDarkMode.png"

function ProductHeader() {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [anchorElNav, setAnchorElNav] = useState(null);
    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };


    function handleSignoutClicked() {
        // send a request to Django with refresh token to revoke the token
        console.log("TODO: sign out");
        setUser(null);
        console.log("set user to null");
        navigate("/sign-in");
    }

    return (
        <HideOnScroll>
            <AppBar
                position="sticky"
                sx={{
                    backgroundColor: "hsl(0, 0%, 100%, 0.027)",
                    backdropFilter: "blur(15px)",
                    borderRadius: "20px",
                    marginBottom: "4rem",
                    top: "1rem",
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar disabledGutters>
                        <Brand variant="product" />
                        <Features />
                        <Stack direction="row" sx={{ display: { xs: "none", md: "flex" } }}>
                            <Button
                                href="/account"
                                sx={{
                                    color: "grey",
                                    borderRadius: "10px",
                                    "&:hover": {background: "none", color: "var(--main-dust-grey)"},
                                }}
                            >
                                <AccountCircleIcon />
                            </Button>
                            <Button
                                onClick={handleSignoutClicked}
                                sx={{
                                    color: "black",
                                    borderRadius: "10px",
                                    "&:hover": {backgroundColor: "var(--main-brick)"},
                                    backgroundColor: "var(--main-dust-grey)",
                                }}
                            >
                                Sign Out
                            </Button>
                        </Stack>
                        <Box sx={{ display: {xs: "block", md: "none"} }}>
                            <IconButton
                                size="large"
                                onClick={handleOpenNavMenu}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorElNav}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                                sx={{
                                    display: { xs: 'block', md: 'none' },
                                    ".MuiMenu-paper": {
                                        backgroundColor: "hsl(0, 0%, 100%, 0.027)",
                                        backdropFilter: "blur(15px)",
                                        borderRadius: "20px"
                                    },
                                    ".MuiMenuItem-root": {color: "white"},
                                }}
                            >
                                <MenuItem>
                                    <Link
                                        href="/account"
                                        color="inherit"
                                        sx={{ margin: "auto" }}
                                    >
                                        <AccountCircleIcon />
                                    </Link>
                                </MenuItem>
                                <MenuItem onClick={handleSignoutClicked} sx={{ "&:hover": {backgroundColor: "var(--main-brick)"} }}>
                                    Sign Out
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </HideOnScroll>
    );
}

export default ProductHeader;
