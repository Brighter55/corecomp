import { styled } from '@mui/material/styles';
import Stack from "@mui/material/Stack"

const TwoColumn = styled(Stack)(({ theme }) => ({
    gap: "2rem",
    [theme.breakpoints.up("sm")] : {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
}));

export default TwoColumn
