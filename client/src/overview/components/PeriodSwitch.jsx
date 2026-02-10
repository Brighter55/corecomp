
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

function Switch({ period, setPeriod }) {
  function handleChange(event, newPeriod) {
    setPeriod(newPeriod);
  }


  return (
    <ToggleButtonGroup
      value={period}
      exclusive
      onChange={handleChange}
      sx={{
        backgroundColor: "var(--main-dust-grey)",
      }}
    >
      <ToggleButton value="annually">annually</ToggleButton>
      <ToggleButton value="quarterly">quarterly</ToggleButton>
    </ToggleButtonGroup>
  );
}

export default Switch;
