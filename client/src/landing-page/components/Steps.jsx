import { useState } from "react"
//mui components
import Box from '@mui/system/Box';
import Stack from '@mui/system/Stack';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PersonIcon from '@mui/icons-material/Person';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import BarChartIcon from '@mui/icons-material/BarChart';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import Grow from '@mui/material/Grow';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
// assets
import signUpImage from "../../assets/signUp.png"
import subscribeImage from "../../assets/subscribe.png"
import researchImage from "../../assets/research.png"


const CustomStepConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}, &.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: "#A3B18A",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#DAD7CD',
    borderRadius: 1,
  },
}));

const CustomStepIconRoot = styled('div')(({ theme }) => ({
  backgroundColor: '#DAD7CD',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  variants: [
    {
      props: ({ ownerState }) => ownerState.active || ownerState.completed,
      style: {
        backgroundColor:
          "#588157",
        boxShadow: '0 4px 10px 0 rgba(218, 215, 205,.25)',
      },
    },
  ],
}));

const StyledImage = styled(Box)(({theme}) => ({
  borderRadius: "30px",
  boxShadow: "0 0 20px 2px black",
  [theme.breakpoints.up("xs")]: {
    height: "11rem",
    width: "20rem",
  },
  [theme.breakpoints.up("sm")]: {
    height: "20rem",
    width: "35rem",
  },
  [theme.breakpoints.up("md")]: {
    height: "30rem",
    width: "55rem",
  },
}));

export default function Steps() {

  function CustomStepIcon(props) {
    const { active, completed, className } = props;

    const icons = {
      1: <PersonIcon />,
      2: <SubscriptionsIcon />,
      3: <BarChartIcon />,
    };

    return (
      <CustomStepIconRoot ownerState={{ completed, active }} className={className}>
        {icons[String(props.icon)]}
      </CustomStepIconRoot>
    );
  }

  CustomStepIcon.propTypes = {
    /**
     * Whether this step is active.
     * @default false
     */
    active: PropTypes.bool,
    className: PropTypes.string,
    /**
     * Mark the step as completed. Is passed to child components.
     * @default false
     */
    completed: PropTypes.bool,
    /**
     * The label displayed in the step icon.
     */
    icon: PropTypes.node,
  };

  const steps = [
    {label: "1. Create Account", description: "create account to get started", image: signUpImage},
    {label: "2. Subscribe", description: "activate your free trial!", image: subscribeImage},
    {label: "3. Research", description: "Enter stock symbol and learn about them!", image: researchImage},
  ]

  const [activeStep, setActiveStep] = useState(0);

  function handleNext() {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }
  function handleBack() {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }
  function handleReset() {
    setActiveStep(0);
  }

  return (
    <Stack spacing={4}>
      <Typography variant="h3" textAlign="center">
        Stock Analysis in 3 Steps
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel connector={<CustomStepConnector />}>
        {steps.map((step) => (
          <Step key={step.label}>
            <StepLabel
              StepIconComponent={CustomStepIcon}
              sx={{
                '& .MuiStepLabel-label.MuiStepLabel-alternativeLabel': {
                  color: 'var(--main-dust-grey)',
                  fontSize: {xs: "1rem", md: "1.4rem"},
                },
              }}
              >{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === steps.length ? (
        // completed
        <Stack sx={{ alignItems: "center"}} spacing={2}>
          <StyledImage component="img" src={researchImage} />
          <Typography variant="h4">All steps completed</Typography>
          <Typography variant="body1" sx={{ color: "#8e8e8dff", margin: 0 }}>CoreComp is ready to serve!</Typography>
          <Button onClick={handleReset} sx={{ backgroundColor: "var(--main-dust-grey)", color: "var(--main-pine-teal)", alignSelf: "end"}}>Start Over</Button>
        </Stack>
      ) : (
        <Stack sx={{ alignItems: "center" }} spacing={2}>
          <Grow
            in={true}
            key={activeStep}
          >
            <StyledImage component="img" src={steps[activeStep].image} />
          </Grow>
          <Typography variant="h4">{steps[activeStep].label}</Typography>
          <Typography variant="body1" sx={{ color: "#8e8e8dff", margin: 0 }}>{steps[activeStep].description}</Typography>
          <Stack direction="row" sx={{ width: "100%", justifyContent: "space-between" }}>
            <Button onClick={handleBack} disabled={activeStep === 0} sx={{ color: "var(--main-dust-grey)" }}>Back</Button>
            <Button
              onClick={handleNext}
              sx={{ backgroundColor: "var(--main-fern)", color: "var(--main-dust-grey)" }}
            >
              {activeStep === steps.length - 1 ? "complete" : "next"}
            </Button>
          </Stack>
        </Stack>
      )}
    </Stack>
  )
}
