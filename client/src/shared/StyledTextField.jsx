import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

const StyledTextField = styled(TextField)(({theme}) => ({
    "& .MuiInputBase-root": {
        backgroundColor: "lightgrey",
    },
    "& .MuiInputLabel-root.Mui-focused": {
        color: "#3A5A40",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#3A5A40",
    },
    "& .MuiFormHelperText-root": {backgroundColor: "#DAD7CD", margin: "0"},
    "& .MuiInputLabel-shrink": {top: "4px"},
}));


export default StyledTextField;
