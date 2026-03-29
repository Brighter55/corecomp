import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Explanation from './Explanation';
import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  useGaugeState,
} from '@mui/x-charts/Gauge';

const explanation = (
    <Stack spacing={2}>
        <Typography variant="explanationTopic">What is it?</Typography>
        <Typography variant="explanationText">
            beta coefficient measures a stock's volatility (systematic risk) relative to the overall market, usually the S&P 500, which has a beta of 1.0
        </Typography>
        <Typography variant="explanationTopic">Interpretation</Typography>
        <Stack direction="column" spacing={1}>
            <Typography variant="explanationText">
                β = 1.0: The stock price moves exactly with the market
            </Typography>
            <Typography variant="explanationText">
              β &gt; 1.0: The stock is more volatile than the market, indicating higher risk and higher potential reward.
            </Typography>
            <Typography variant="explanationText">
              β &lt; 1.0: The stock is less volatile than the market, indicating lower risk.
            </Typography>
            <Typography variant="explanationText">
              *β &lt; 0: The stock moves in the opposite direction of the market (e.g., gold or inverse ETFs).
            </Typography>
        </Stack>
    </Stack>
)

export default function BetaChart({beta}) {
  const theme = useTheme();
  const upSm = useMediaQuery(theme.breakpoints.up('sm'));

  const gaugeWidth = upSm ? 400 : 300;
  const numericBeta = Number.parseFloat(beta);
  const hasValidBeta = Number.isFinite(numericBeta);

  return (
    <Stack spacing={1} width="100%" sx={{ alignItems: "center" }}>
      <Stack spacing={1} direction="row" alignItems="center">
        <Typography variant="h4" align="center">Beta Coefficient</Typography>
        <Explanation explanation={explanation}/>
      </Stack>
      <GaugeContainer
        width={gaugeWidth}
        height={400}
        startAngle={-110}
        endAngle={110}
        valueMin={-1}
        valueMax={3}
        value={hasValidBeta ? numericBeta : 0}
      >
        <GaugeReferenceArc />
        <GaugeMidValueMarker
          startAngle={-110}
          endAngle={110}
          valueMin={-1}
          valueMax={3}
          targetValue={1}
          label="1"
        />
        <GaugeValueArc 
          stroke="var(--main-dust-grey)"
          strokeWidth={1}
          sx={{ fill: "var(--main-dry-sage)" }} 
        />
        <GaugePointer label={hasValidBeta ? numericBeta.toFixed(2) : '--'} />
      </GaugeContainer>
    </Stack>
  );
}

function GaugeMidValueMarker({
  startAngle,
  endAngle,
  valueMin,
  valueMax,
  targetValue,
  label,
}) {
  const { outerRadius, cx, cy } = useGaugeState();
  const range = valueMax - valueMin;

  if (!Number.isFinite(range) || range === 0) {
    return null;
  }

  const progress = (targetValue - valueMin) / range;
  const markerAngleDeg = startAngle + progress * (endAngle - startAngle);
  const markerAngleRad = (markerAngleDeg * Math.PI) / 180;

  const lineInnerRadius = outerRadius - 20;
  const lineOuterRadius = outerRadius + 8;
  const labelRadius = outerRadius + 26;

  const lineStart = {
    x: cx + lineInnerRadius * Math.sin(markerAngleRad),
    y: cy - lineInnerRadius * Math.cos(markerAngleRad) + 40,
  };
  const lineEnd = {
    x: cx + lineOuterRadius * Math.sin(markerAngleRad),
    y: cy - lineOuterRadius * Math.cos(markerAngleRad),
  };
  const labelPoint = {
    x: cx + labelRadius * Math.sin(markerAngleRad),
    y: cy - labelRadius * Math.cos(markerAngleRad),
  };

  return (
    <g>
      <path
        d={`M ${lineStart.x} ${lineStart.y} L ${lineEnd.x} ${lineEnd.y}`}
        stroke="var(--main-dust-grey)"
        strokeWidth={2}
      />
      <text
        x={labelPoint.x}
        y={labelPoint.y}
        fontSize={24}
        fontWeight={600}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fill: 'var(--main-dust-grey)' }}
      >
        {label}
      </text>
    </g>
  );
}

function GaugePointer({ label }) {
  const { valueAngle, outerRadius, cx, cy } = useGaugeState();

  if (valueAngle === null) {
    // No value to display
    return null;
  }

  const target = {
    x: cx + outerRadius * Math.sin(valueAngle),
    y: cy - outerRadius * Math.cos(valueAngle),
  };
  const labelRadius = outerRadius + 28;
  const labelPoint = {
    x: cx + labelRadius * Math.sin(valueAngle),
    y: cy - labelRadius * Math.cos(valueAngle),
  };

  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="var(--main-dust-grey)" />
      <path
        d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
        stroke="var(--main-dust-grey)"
        strokeWidth={3}
      />
      <text
        x={labelPoint.x}
        y={labelPoint.y}
        fontSize={24}
        fontWeight={600}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fill: 'var(--main-dust-grey)' }}
      >
        {label}
      </text>
    </g>
  );
}

