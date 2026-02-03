import { useState, useEffect } from "react";
import Autocomplete from '@mui/material/Autocomplete';
import StyledTextField from "./StyledTextField";
import CircularProgress from '@mui/material/CircularProgress';
import { authenticatedClient } from "../helpers/api.js"

// user types => setDebounced if pauses for 300ms => getOptions() => options now works!
export default function SymbolSearch({ handleSearchSubmit }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [inputValue, setInputValue] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    if (!debounced) {
      return;
    }

    getOptions(debounced);
    console.log("getOptions Fired");

  }, [debounced]);

  useEffect(() => {
    if (!inputValue) {
      return;
    }
    console.log("input changed!");
    setLoading(true);
    const handler = setTimeout(() => {setDebounced(inputValue)}, 300);
    
    return () => {
      clearTimeout(handler);
      setLoading(false);
    }
  }, [inputValue]);

  async function getOptions() {
    const response = await authenticatedClient({endpoint: "/pages/symbol-search", payload: {symbol: debounced}});
    const data = await response.json();
    setLoading(false);
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
      onChange={(event, newValue) => {
        event.preventDefault();
        console.log("newValue.symbol in onChange is", newValue.symbol)
        handleSearchSubmit(event, newValue.symbol);
      }}
      inputValue={inputValue}
      onInputChange={(event, newValue) => {
        setInputValue(newValue);
        console.log("onInputChange fires");
      }}

      getOptionLabel={(option) => `${option.symbol} | ${option.name}`}
      options={options}
      sx={{ width: 500 }}
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      loading={loading}
      renderInput={(params) => (
        <StyledTextField
          {...params}
          label="Symbol"

          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress sx={{ color: "var(--main-fern)" }} size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}

        />
      )}
    />
  );
}