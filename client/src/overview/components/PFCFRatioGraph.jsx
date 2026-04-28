import GeneralBarGraph from "./GeneralBarGraph.jsx";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const explanation = (
  <Stack spacing={2}>
      <Typography variant="explanationTopic">What is it?</Typography>
      <Typography variant="explanationText">
          P/FCF (Price-to-Free Cash Flow) shows how much investors are paying for the actual cash a company generates after expenses and reinvestment. It focuses on real, usable cash rather than accounting profit.
      </Typography>
      <Typography variant="explanationTopic">Calculation</Typography>
      <Typography
          variant="explanationText"
          sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
      >
          Price to Free Cash Flow = Market Cap / Free Cash Flow
      </Typography>
      <Typography variant="explanationTopic">Interpretation</Typography>
      <Stack direction="row" spacing={1}>
          <TrendingUpIcon
              sx={{ color: "green", bgcolor: "white", borderRadius: "10px" }}
          />
          <Typography variant="explanationText">
              Rising trend suggests investors are paying more for each dollar of cash flow, usually due to strong growth expectations, improving cash efficiency, or high-quality, predictable cash generation.
          </Typography>
      </Stack>
      <Stack direction="row" spacing={1}>
          <TrendingDownIcon
              sx={{ color: "red", bgcolor: "white", borderRadius: "10px" }}
          />
          <Typography variant="explanationText">
              Falling trend suggests investors are paying less for each dollar of cash flow, which may signal slowing growth, declining cash flow quality, or a potential undervaluation.
          </Typography>
      </Stack>
  </Stack>
)


export default function PFCFRatioGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Price to Free Cash Flow"
            barName="Price to Free Cash Flow"
            dataKey="PFCFRatio"
            explanation={explanation}
            yDomain={null}
            yTickFormatter={null}
            tooltipFormatter={null}
        />
    );
}
