import GeneralBarGraph from "./GeneralBarGraph.jsx";
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const explanation = (
  <Stack spacing={2}>
      <Typography variant="explanationTopic">What is it?</Typography>
      <Typography variant="explanationText">
          The quick ratio, or "acid-test ratio," measures a company’s ability to pay short-term liabilities (due within one year) using its most liquid assets—cash, marketable securities, and accounts receivable. It excludes inventories and prepaid expenses, providing a stricter liquidity test than the current ratio.
      </Typography>
      <Typography variant="explanationTopic">Calculation</Typography>
      <Typography
          variant="explanationText"
          sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
      >
          Quick Ratio = (Cash & Cash Equivalents + Short Term Investment + Current Net Receivables) / Total Current Liabilities
      </Typography>
      <Typography variant="explanationTopic">Interpretation</Typography>
      <Stack direction="column" spacing={1}>
          <Typography variant="explanationText">
              &gt; 1.0: The company has sufficient liquid assets to cover its current liabilities.
          </Typography>
          <Typography variant="explanationText">
              &lt; 1.0: The company may struggle to pay immediate debts, suggesting potential cash flow issues.
          </Typography>
          <Typography variant="explanationText">
              Too High Ratio (e.g., 7 or 8): May indicate an inefficient use of cash that could be used for growth.
          </Typography>
          <Typography variant="explanationText">
              Trends: A decreasing ratio over time (e.g., 1.1 down to 0.9) suggests deteriorating liquidity.
          </Typography>
      </Stack>
  </Stack>
)


export default function QuickRatioGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Quick Ratio"
            barName="Quick Ratio"
            dataKey="QuickRatio"
            explanation={explanation}
            yDomain={null}
            yTickFormatter={null}
            tooltipFormatter={null}
        />
    );
}
