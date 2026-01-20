import { useState } from "react";
import Autocomplete from '@mui/material/Autocomplete';
import StyledTextField from "./StyledTextField";


export default function SymbolSearch({ input, setInput }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);

  async function getOptions() {
    if (options.length > 0) {
      return;
    }
    const response = await fetch("http://127.0.0.1:8000/pages/symbol-search", {
      method: "POST",
      headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("access")}`,
        },
    });
    const data = await response.json();
    console.log("load");
    setOptions(data);
  }

  const handleOpen = () => {
    setOpen(true);
    getOptions();
  };

  const handleClose = () => {
    setOpen(false);
  };

  
  return (
    <Autocomplete
      value={options.find(option => option.symbol === input) || null}
      onChange={(event, newValue) => {setInput(newValue.symbol)}}
      sx={{ width: 500 }}
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      getOptionLabel={(option) => `${option.symbol} | ${option.name}`}
      isOptionEqualToValue={(option, value) => option.symbol === value.symbol}
      options={options}
      renderInput={(params) => (
        <StyledTextField
          {...params}
          label="Symbol"
        />
      )}
    />
  );
}