import GeneralBarGraph from "./GeneralBarGraph.jsx";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const explanation = (
  <Stack spacing={2}>
      <Typography variant="explanationTopic">What is it?</Typography>
      <Typography variant="explanationText">
          A profit margin shows the percentage of revenue a company keeps as profit after subtracting its costs
      </Typography>
      <Typography variant="explanationTopic">Calculation</Typography>
      <Typography
          variant="explanationText"
          sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
      >
          Profit Margin Percent = (net income / total revenue) * 100
      </Typography>
      <Typography variant="explanationTopic">Interpretation</Typography>
      <Stack direction="row" spacing={1}>
          <TrendingUpIcon
              sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
          />
          <Typography variant="explanationText">
              A positive trend in a company's profit margin percentage means it's keeping more profit for every dollar of sales over time, signaling improved financial health, better cost control, pricing power, and operational efficiency, making it more attractive to investors and indicating a sustainable business model
          </Typography>
      </Stack>
      <Stack direction="row" spacing={1}>
          <TrendingDownIcon
              sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
          />
          <Typography variant="explanationText">
                A negative trend in a company's profit margin means it's losing more money relative to its revenue over time, signaling deeper issues like rising costs (materials, labor, operations), falling sales, poor pricing, or inefficient management, indicating an unsustainable model
          </Typography>
      </Stack>
  </Stack>
)


export default function ProfitMarginGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="Profit Margin Percentage"
            barName="Profit Margin"
            dataKey="profitMarginPercent"
            explanation={explanation}
            yDomain={null}
            yTickFormatter={(value) => `${value}%`}
            tooltipFormatter={(value) => `${value}%`}
        />
    );
}
