import GeneralBarGraph from "./GeneralBarGraph.jsx";
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const explanation = (
  <Stack spacing={2}>
      <Typography variant="explanationTopic">What is it?</Typography>
      <Typography variant="explanationText">
          Current ratio is a liquidity metric that measures a company's ability to pay short-term obligations (due within one year) with its short-term assets.
      </Typography>
      <Typography variant="explanationTopic">Calculation</Typography>
      <Typography
          variant="explanationText"
          sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
      >
          Current Ratio = Total Current Assets / Total Current Liabilities
      </Typography>
      <Typography variant="explanationTopic">Interpretation</Typography>
      <Stack direction="column" spacing={1}>
          <Typography variant="explanationText">
              Current ratio &lt; 1: The company may have difficulty paying short-term debts.
          </Typography>
          <Typography variant="explanationText">
              Current ratio 1 - 1.5: Generally considered acceptable, depending on the industry.
          </Typography>
          <Typography variant="explanationText">
              Current ratio &gt; 3: Could indicate high liquidity, but may also mean the company is not using its assets efficiently.
          </Typography>
      </Stack>
  </Stack>
)


export default function CurrentRatioGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Current Ratio"
            barName="Current Ratio"
            dataKey="CurrentRatio"
            explanation={explanation}
            yDomain={null}
            yTickFormatter={null}
            tooltipFormatter={null}
        />
    );
}