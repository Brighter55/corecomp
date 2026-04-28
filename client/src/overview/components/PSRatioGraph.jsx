import GeneralBarGraph from "./GeneralBarGraph.jsx";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const explanation = (
  <Stack spacing={2}>
      <Typography variant="explanationTopic">What is it?</Typography>
      <Typography variant="explanationText">
          Shows how much investors pay for $1 of a company's revenue. A 1.0 ratio means investors are paying $1 for every $1 of revenue.
      </Typography>
      <Typography variant="explanationTopic">Calculation</Typography>
      <Typography
          variant="explanationText"
          sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
      >
          P/S Ratio = Market Cap / Total Revenue
      </Typography>
      <Typography variant="explanationTopic">Interpretation</Typography>
      <Stack direction="row" spacing={1}>
          <TrendingUpIcon
              sx={{ color: "green", bgcolor: "white", borderRadius: "10px" }}
          />
          <Typography variant="explanationText">
              Rising P/S suggests investors are willing to pay more for each dollar of sales, usually due to strong growth expectations, improving margins, or market hype.
          </Typography>
      </Stack>
      <Stack direction="row" spacing={1}>
          <TrendingDownIcon
              sx={{ color: "red", bgcolor: "white", borderRadius: "10px" }}
          />
          <Typography variant="explanationText">
              Falling P/S suggests weakening investor confidence, slowing growth, declining margins, or the stock becoming undervalued relative to its revenue.
          </Typography>
      </Stack>
  </Stack>
)


export default function PSRatioGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="P/S Ratio"
            barName="P/S Ratio"
            dataKey="PSRatio"
            explanation={explanation}
            yDomain={null}
            yTickFormatter={null}
            tooltipFormatter={null}
        />
    );
}
