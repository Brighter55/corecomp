import { useState } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';

const StyledButton = styled(Button)({
  borderRadius: "10px",
  color: "grey",
  "&:hover": {color: "var(--main-dust-grey)", background: "none"},
});

export default function Features() {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box  sx={{ display: "flex", flexGrow: 1, justifyContent: "center"}}>
      <StyledButton /*show in md and up*/
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          display: {xs: "none", md: "flex"},
        }}
      >
        features
      </StyledButton>
      <StyledButton /*show in xs only*/
        onClick={handleClick}
        sx={{
          display: {xs: "flex", md: "none"},
        }}
      >
        <KeyboardArrowDownIcon />
      </StyledButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          ".MuiMenu-paper": {
            backgroundColor: "hsl(0, 0%, 100%, 0.027)",
            backdropFilter: "blur(15px)",
            borderRadius: "20px"
          },
          ".MuiMenuItem-root": {color: "white"},
        }}
      >
        <MenuItem onClick={handleClose}>
          <Link href="/overview" color="inherit">
            overview
          </Link>
        </MenuItem>
      </Menu>
    </Box>
  );
}
