import GeneralBarGraph from "./GeneralBarGraph.jsx";
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const explanation = (
  <Stack spacing={2}>
      <Typography variant="explanationTopic">What is it?</Typography>
      <Typography variant="explanationText">
          Return on Assets (ROA) is measures how efficiently a company uses its assets to generate profit. It shows the net income produced per dollar of assets, indicating operational efficiency. A higher ROA indicates more effective management of assets.
      </Typography>
      <Typography variant="explanationTopic">Calculation</Typography>
      <Typography
          variant="explanationText"
          sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
      >
          ROA = Net Income / Total Assets
      </Typography>
      <Typography variant="explanationTopic">Interpretation</Typography>
      <Stack direction="column" spacing={1}>
          <Typography variant="explanationText">
              Rising Trend: Indicates increasing operational efficiency, better asset utilization, and smarter, more productive investment in assets over time.
          </Typography>
          <Typography variant="explanationText">
              Declining Trend: Acts as a potential early warning signal for aging assets, rising unplanned costs, or decreasing efficiency.
          </Typography>
          <Typography variant="explanationText">
              High/Low Numbers: Generally, &gt;5% is considered decent, and &gt;10% is strong, though this varies heavily by industry. Asset-heavy industries (e.g., utilities) often have lower ROA compared to tech or service industries.
          </Typography>
      </Stack>
  </Stack>
)


export default function ReturnOnAssetsGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="ROA Percentage"
            barName="Return on Assets"
            dataKey="ROAPercentage"
            explanation={explanation}
            yDomain={null}
            yTickFormatter={(value) => `${value}%`}
            tooltipFormatter={(value) => `${value}%`}
        />
    );
}
