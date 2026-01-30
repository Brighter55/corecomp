import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';


const StyledButton = styled(Button)({
    color: "black",
    borderRadius: "10px",
    "&:hover": {backgroundColor: "lightgrey"},
    backgroundColor: "var(--main-dust-grey)",
});

export default StyledButton