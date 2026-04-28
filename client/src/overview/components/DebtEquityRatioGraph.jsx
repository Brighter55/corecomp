import GeneralBarGraph from "./GeneralBarGraph.jsx";
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const explanation = (
  <Stack spacing={2}>
      <Typography variant="explanationTopic">What is it?</Typography>
      <Typography variant="explanationText">
          The debt-to-equity (D/E) ratio measures a company's financial leverage by dividing its total liabilities by shareholder equity. It shows how much debt a company uses to finance assets relative to the value of shareholders' equity. A lower ratio implies less risk, while a higher ratio indicates greater leverage.
      </Typography>
      <Typography variant="explanationTopic">Calculation</Typography>
      <Typography
          variant="explanationText"
          sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
      >
          Debt/Equity Ratio = Short Term & Long Term Debt / Total Shareholder Equity
      </Typography>
      <Typography variant="explanationTopic">Interpretation</Typography>
      <Stack direction="column" spacing={1}>
          <Typography variant="explanationText">
              High D/E Ratio (&gt; 1.5–2.0): Suggests the company is financing growth heavily through debt. This indicates higher risk, especially during economic downturns, as interest expenses must be paid regardless of earnings.
          </Typography>
          <Typography variant="explanationText">
              Low D/E Ratio (&lt; 1.0): Suggests a more conservative approach with less debt and stronger equity backing, typically seen as more stable.
          </Typography>
          <Typography variant="explanationText">
              Note: The definition of a "good" ratio varies by industry; capital-intensive industries (e.g., manufacturing, utilities) often have higher acceptable ratios (e.g., 2.0 or higher) compared to technology companies.
          </Typography>
      </Stack>
  </Stack>
)


export default function DebtEquityRatioGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Debt/Equity Ratio"
            barName="Debt/Equity Ratio"
            dataKey="DebtEquityRatio"
            explanation={explanation}
            yDomain={null}
            yTickFormatter={null}
            tooltipFormatter={null}
        />
    );
}
