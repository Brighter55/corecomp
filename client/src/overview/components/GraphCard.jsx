import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';

const GraphCard = styled(Stack)(({ graphClicked, theme }) => {
    return graphClicked ? {
        position: "fixed",
        height: "80vh",
        width: "90vw",
        top: "10vh",
        left: "5vw",
        background: "var(--main-dust-grey)",
        color: "var(--main-pine-teal)",
        borderRadius: "10px",
        zIndex: 3,
        transition: "height .5s ease",
        overflow: "auto",
    } : {
        height: "20rem",
        width: "100%",
        minWidth: "21rem",
        background: "var(--main-dust-grey)",
        borderRadius: "10px",
        color: "var(--main-pine-teal)",
        [theme.breakpoints.up("sm")]: {
            height: "25rem"
        },
    };
});

export default GraphCard
