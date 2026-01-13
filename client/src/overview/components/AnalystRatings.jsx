import { pieArcClasses, PieChart, pieClasses } from '@mui/x-charts/PieChart';
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function analystRatings({
  analystTargetPrice,
  analystRatingStrongBuy,
  analystRatingBuy,
  analystRatingHold,
  analystRatingSell,
  analystRatingStrongSell
 }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const strongBuyAnalyst = parseInt(analystRatingStrongBuy);
  const buyAnalyst = parseInt(analystRatingBuy);
  const strongSellanalyst = parseInt(analystRatingStrongSell);
  const sellAnalyst = parseInt(analystRatingSell);
  const holdAnalyst = parseInt(analystRatingHold);

  const totalBuyAnalyst = strongBuyAnalyst + buyAnalyst;
  const totalSellAnalyst = strongSellanalyst + sellAnalyst;
  const totalAnalyst = totalBuyAnalyst + totalSellAnalyst + holdAnalyst;

  // responsiveness
  const innerRadius1 = 0;
  const outerRadius1 = isSmallScreen ? 100 : 125;
  const innerRadius2 = isSmallScreen ? 105 : 130;
  const outerRadius2 = isSmallScreen ? 135 : 160;
  const labelRadius = isSmallScreen ? 160 : 200;

  const data1 = [
    { label: 'Buy', value: totalBuyAnalyst, color: "var(--main-dry-sage)" },
    { label: 'Sell', value: totalSellAnalyst, color: "var(--main-brick)" },
    { label: 'Hold', value: holdAnalyst, color: "var(--main-dust-grey)" },
  ];
  console.log(data1);
  const data2 = [
    { label: 'Buy', value: buyAnalyst, color: "var(--main-dry-sage)"},
    { label: 'Strong Buy', value: strongBuyAnalyst, color: "var(--main-fern)" },
    { label: 'Sell', value: sellAnalyst, color: "var(--main-brick)" },
    { label: 'Strong Sell', value: strongSellanalyst, color: "darkred" },
    { label: 'Hold', value: holdAnalyst, color: "var(--main-dust-grey)" }
  ];
  console.log(data2);

  const settings = {
    series: [
      {
        innerRadius: innerRadius1,
        outerRadius: outerRadius1,
        data: data1,
        highlightScope: { fade: 'global', highlight: 'item' },
        paddingAngle: 1,
        arcLabel: 'label',
      },
      {
        id: 'outer',
        innerRadius: innerRadius2,
        outerRadius: outerRadius2,
        data: data2,
        highlightScope: { fade: 'global', highlight: 'item' },
        paddingAngle: 2,
        arcLabel: (item) => item.label,
        arcLabelRadius: labelRadius,
      },
    ],
    height: 420,
    hideLegend: true,
  };

  return (
    <Stack sx={{ width: "100%", textAlign: "center", }} spacing={1}>
      <Typography variant="h4">Ratings by {totalAnalyst} analysts</Typography>
      <Typography variant="h6">Target Price: {analystTargetPrice}</Typography>
      <PieChart
        {...settings}
        sx={{
          [`.${pieClasses.series}[data-series="outer"] .${pieArcClasses.root}`]: {
            opacity: 0.6,
          },
          "& .MuiPieArcLabel-root": {
            fontWeight: 'bold',
          }
        }}
      />
    </Stack>
  );
}
