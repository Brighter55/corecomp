import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';


const StyledAccordion = styled(Accordion)({
  backgroundColor: "inherit",
  color: "inherit",
  border: "1px solid rgba(218, 215, 205, 0.5)",
  borderTop: "0",
  borderLeft: "0",
  borderRight: "0",
});

const StyledAccordionDetails = styled(AccordionDetails)({
  padding: "0",
  paddingBottom: "20px",
});

const StyledExpandMoreIcon = styled(ExpandMoreIcon)({
  color: "var(--main-dust-grey)",
});

export default function ControlledAccordions() {
  const [expanded, setExpanded] = React.useState(false);

  function handleChange(panel, isExpanded) {
    setExpanded(isExpanded ? panel : false);
  }

  return (
    <>
      <StyledAccordion expanded={expanded === 'panel1'}
        onChange={(event, isExpanded) => {handleChange("panel1", isExpanded)}}
        disableGutters
        elevation={0}
      >
        <AccordionSummary
          expandIcon={<StyledExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
          sx={{ padding: "0" }}
        >
          <h2>How many companies can CoreComp research?</h2>
        </AccordionSummary>
        <StyledAccordionDetails>
          <Typography>
            Our financial data are from U.S. Securities and Exchange Commission (SEC) filings, so if the company you are looking for files with the SEC, you are able to search it with CoreComp. This means comprehensive coverage for US-listed companies.
          </Typography>
        </StyledAccordionDetails>
      </StyledAccordion>
      <StyledAccordion expanded={expanded === 'panel2'}
        onChange={(event, isExpanded) => {handleChange("panel2", isExpanded)}}
        disableGutters
        elevation={0}
      >
        <AccordionSummary
          expandIcon={<StyledExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
          sx={{ padding: "0" }}
        >
          <h2>Who is CoreComp for?</h2>
        </AccordionSummary>
        <StyledAccordionDetails>
          <Typography>
            CoreComp's is built to be beginner-friendly enough so that even people with no background in finance could understand and make sense of it, but everyone who wants to understand companies' fundamentals could use it.
          </Typography>
        </StyledAccordionDetails>
      </StyledAccordion>
      <StyledAccordion expanded={expanded === 'panel3'}
        onChange={(event, isExpanded) => {handleChange("panel3", isExpanded)}}
        disableGutters
        elevation={0}
      >
        <AccordionSummary
          expandIcon={<StyledExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
          sx={{ padding: "0" }}
        >
          <h2>Help?</h2>
        </AccordionSummary>
        <StyledAccordionDetails>
          <Typography>
            If you encounter any problems, contact our support at support@corecomp.com
          </Typography>
        </StyledAccordionDetails>
      </StyledAccordion>
      <StyledAccordion expanded={expanded === 'panel4'}
        onChange={(event, isExpanded) => {handleChange("panel4", isExpanded)}}
        disableGutters
        elevation={0}
        sx={{ borderBottom: 0 }}
      >
        <AccordionSummary
          expandIcon={<StyledExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
          sx={{ padding: "0" }}
        >
          <h2>Will CoreComp have new features?</h2>
        </AccordionSummary>
        <StyledAccordionDetails>
          <Typography>
            Of course! CoreComp is always evolving. We are always looking for new analysis tools that would be beneficial to investors.
          </Typography>
        </StyledAccordionDetails>
      </StyledAccordion>
    </>
  );
}
