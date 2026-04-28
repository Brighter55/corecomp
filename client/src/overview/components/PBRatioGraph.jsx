import GeneralBarGraph from "./GeneralBarGraph.jsx";
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const explanation = (
  <Stack spacing={2}>
	  <Typography variant="explanationTopic">What is it?</Typography>
	  <Typography variant="explanationText">
		  Price-to-Book (P/B) ratio measures a company's market value relative to its book value (total assets minus liabilities). It tells you how much investors are paying for each dollar of a company's net assets.
	  </Typography>
	  <Typography variant="explanationTopic">Calculation</Typography>
	  <Typography
		  variant="explanationText"
		  sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
	  >
		  P/B Ratio = Market Price per Share / Book Value per Share
	  </Typography>
	  	  <Typography
		  variant="explanationText"
		  sx={{ fontFamily: "'Times New Roman', Times, 'Segoe Ui', Arial, sans-serif" }}
	  >
		  Book Value per Share = (Total Assets - Total Liabilities) / Shares Outstanding
	  </Typography>
	  <Typography variant="explanationTopic">Interpretation</Typography>
	  <Stack direction="column" spacing={1}>
		  <Typography variant="explanationText">
			  	P/B less than 1: Potential indicator of an undervalued stock or a company experiencing financial distress.
		  </Typography>
		  <Typography variant="explanationText">
				P/B greater than 1: Generally suggests the stock is trading at a premium to its net assets, often reflecting high growth expectations, valuable intangibles, or high returns on assets.
		  </Typography>
		  <Typography variant="explanationText">
				P/B = 1: The market price is valued exactly in line with the company's accounting net worth.
		  </Typography>
		  <Stack direction="row" spacing={1}>
			  <TipsAndUpdatesIcon sx={{ color: "#D4A373", mt: 0.5, flexShrink: 0 }} />
			  <Typography variant="explanationText">
					It is best used when comparing companies within the same sector (e.g., banking or manufacturing), as industries with low physical assets like tech may have high P/B ratios.
			  </Typography>
		  </Stack>
	  </Stack>
  </Stack>
)


export default function PBRatioGraph({ statement, period }) {
	return (
		<GeneralBarGraph
			statement={statement}
			period={period}
			title="P/B Ratio"
			barName="P/B Ratio"
			dataKey="PBRatio"
			explanation={explanation}
			yDomain={null}
			yTickFormatter={null}
			tooltipFormatter={null}
		/>
	);
}
