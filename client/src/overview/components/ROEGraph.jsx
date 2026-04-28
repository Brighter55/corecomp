import GeneralBarGraph from "./GeneralBarGraph.jsx";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const explanation = (
  <Stack spacing={2}>
      <Typography variant="explanationTopic">What is it?</Typography>
      <Typography variant="explanationText">
          Return on equity is a financial ratio that indicates how efficiently a business generates profit from its shareholders’ equity. ROE tells you how well a company turns investor money into profit.
      </Typography>
      <Typography variant="explanationTopic">Calculation</Typography>
      <Typography
          variant="explanationText"
          sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
      >
          ROE = Net Income / Average Shareholder's Equity
      </Typography>
      <Typography variant="explanationTopic">Interpretation</Typography>
      <Stack direction="row" spacing={1}>
          <TrendingUpIcon
              sx={{ color: "green", bgcolor: "white", borderRadius: "10px",}}
          />
          <Typography variant="explanationText">
              A positive trend in a company's return on equity means it is improving its ability to generate profit without necessarily needing more equity capital, which could imply strong growth potential and good management practices.
          </Typography>
      </Stack>
      <Stack direction="row" spacing={1}>
          <TrendingDownIcon
              sx={{ color: "red", bgcolor: "white", borderRadius: "10px",}}
          />
          <Typography variant="explanationText">
                A negative trend in a company's return on equity means it is generating less profit relative to its equity over time, implying that a company may be mismanaged and failing to reinvest earnings in assets that produce profits. 
          </Typography>
      </Stack>
  </Stack>
)


export default function ROEGraph({ statement, period }) {
    return (
        <GeneralBarGraph
            statement={statement}
            period={period}
            title="ROE Percentage"
            barName="Return on Equity"
            dataKey="ROEPercentage"
            explanation={explanation}
            yDomain={null}
            yTickFormatter={(value) => `${value}%`}
            tooltipFormatter={(value) => `${value}%`}
        />
    );
}
