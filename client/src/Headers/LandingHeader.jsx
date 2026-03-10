import Brand from "../shared/Brand.jsx"
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
// components
import HideOnScroll from "./components/HideOnScroll.jsx"
// mui components
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';


function LandingHeader() {
    const navigate = useNavigate();

    const [anchorElNav, setAnchorElNav] = useState(null);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    function handleItemClicked(path) {
        navigate(path);
    }


    return (
        <HideOnScroll>
            <AppBar position="sticky"
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
                        <Brand variant="landing" />
                        <Box sx={{ display: { xs: 'flex', md: 'none', justifyContent: "end", flexGrow: 1  } }}> {/*only show when shrink*/}
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
                                <MenuItem onClick={handleCloseNavMenu}>
                                    <Link
                                        href="/#features"
                                        color="inherit"
                                    >
                                        features
                                    </Link>
                                </MenuItem>
                                <MenuItem onClick={handleCloseNavMenu}>
                                    <Link
                                        href="/#pricing"
                                        color="inherit"
                                    >
                                        pricing
                                    </Link>
                                </MenuItem>
                                <MenuItem onClick={handleCloseNavMenu}>
                                    <Link
                                        href="/upcoming"
                                        color="inherit"
                                    >
                                        upcoming
                                    </Link>
                                </MenuItem>
                                <MenuItem onClick={() => {handleItemClicked("/sign-in")}}>
                                    sign in
                                </MenuItem>
                                <MenuItem onClick={() => {handleItemClicked("/sign-in")}}>
                                    sign up
                                </MenuItem>
                            </Menu>
                        </Box>
                        <Stack
                            direction="row"
                            sx={{
                                display: {xs: "none", md: "flex"},
                                flexGrow: 1,
                                justifyContent: "center"
                            }}
                        >
                            <Button
                                href="/#features"
                                onClick={handleCloseNavMenu}
                                sx={{ color: "grey", display: 'block', "&:hover": {color: "var(--main-dust-grey)"} }}
                            >
                                features
                            </Button>
                            <Button
                                href="/#pricing"
                                onClick={handleCloseNavMenu}
                                sx={{ color: "grey", display: 'block', "&:hover": {color: "var(--main-dust-grey)"} }}
                            >
                                pricing
                            </Button>
                            <Button
                                href="/upcoming"
                                onClick={handleCloseNavMenu}
                                sx={{ color: "grey", display: 'block', "&:hover": {color: "var(--main-dust-grey)"} }}
                            >
                                upcoming
                            </Button>
                        </Stack>
                        <Stack direction="row" sx={{ display: {xs: "none", md: "flex"}}} >
                            <Button
                                onClick={() => {handleItemClicked("/sign-in")}}
                                sx={{
                                    "&:hover": { color: "var(--main-dust-grey)" },
                                    borderRadius: "10px",
                                    color: "grey"
                                }}
                            >
                                Sign in
                            </Button>
                            <Button
                                onClick={() => {handleItemClicked("/sign-up")}}
                                sx={{
                                    color: "black",
                                    fontFamily: "'Segoe Ui', Arial, sans-serif",
                                    borderRadius: "10px",
                                    "&:hover": {backgroundColor: "lightgrey"},
                                    backgroundColor: "var(--main-dust-grey)",
                                }}
                            >
                                Sign Up
                            </Button>
                        </Stack>
                    </Toolbar>
                </Container>
            </AppBar>
        </HideOnScroll>
    );
}

export default LandingHeader;
