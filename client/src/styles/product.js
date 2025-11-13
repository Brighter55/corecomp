export const overviewSearchStyle = {
    width: "100%",
    height: "100%",
    fontSize: "20px",
    "& .MuiFilledInput-root": {
        backgroundColor: "#DAD7CD",
        borderColor: "lightgrey",
        borderWidth: "2px",
        borderStyle: "solid",
        borderRadius: "20px",
        overflow: "hidden",
        '& fieldset': {
            borderRadius: "20px",
            overflow: "hidden",
        }
    },
    '& .MuiInputLabel-filled': {
        color: '#344E41',
        '&.Mui-focused': {
            color: '#344E41',
        },
    },
    '& .MuiFilledInput-underline': {
        '&:before': {
            borderBottomColor: '#3A5A40',
        },
        '&:after': {
            borderBottomColor: '#3A5A40',
        },
    },
    "input": {color: "#344E41", backgroundColor: "#DAD7CD"},
};
