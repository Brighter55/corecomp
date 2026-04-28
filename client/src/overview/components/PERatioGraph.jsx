import GeneralBarGraph from "./GeneralBarGraph.jsx";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const explanation = (
  <Stack spacing={2}>
      <Typography variant="explanationTopic">What is it?</Typography>
      <Typography variant="explanationText">
          PE ratio measures a company’s current share price relative to its earnings per share (EPS). it tells you how much investors are paying for of a company's profit.
      </Typography>
      <Typography variant="explanationTopic">Calculation</Typography>
      <Typography
          variant="explanationText"
          sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
      >
          PE Ratio = Price per Share / Earnings per Share
      </Typography>
      <Typography variant="explanationTopic">Interpretation</Typography>
      <Stack direction="row" spacing={1}>
          <TrendingUpIcon
              sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
          />
          <Typography variant="explanationText">
              A rising P/E often suggests that investors are increasingly optimistic about the company's future prospects. They are willing to pay a higher premium (more dollars for every $1 of profit) today 
          </Typography>
      </Stack>
      <Stack direction="row" spacing={1}>
          <TrendingDownIcon
              sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
          />
          <Typography variant="explanationText">
                A downward trend in a Price-to-Earnings (P/E) ratio graph generally indicates that a company's stock price is falling relative to its earnings, or that its earnings are growing faster than its stock price. This contraction signifies that investors are paying less for each dollar of profit, often making the stock "cheaper" or better value.
          </Typography>
      </Stack>
  </Stack>
)


export default function PERatioGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="PE Ratio"
            barName="PE Ratio"
            dataKey="PERatio"
            explanation={explanation}
            yDomain={null}
            yTickFormatter={null}
            tooltipFormatter={null}
        />
    );
}
