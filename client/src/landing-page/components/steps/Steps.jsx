import { useState } from "react"
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
import styles from "./Steps.module.css"
// assets
import signUpImage from "../../../assets/signUp.png"
import subscribeImage from "../../../assets/subscribe.png"
import researchImage from "../../../assets/research.png"


export default function Steps() {

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
    <div className={styles.steps}>
      <h1 style={{ textAlign: "center", fontSize: "45px" }}>
        Stock Analysis in 3 Steps
      </h1>
      <div className={styles.stepsContent}>
        <Stepper activeStep={activeStep} alternativeLabel connector={<CustomStepConnector />}>
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={CustomStepIcon}
                sx={{
                  '& .MuiStepLabel-label.MuiStepLabel-alternativeLabel': {
                    color: '#DAD7CD',
                    fontSize: "20px",
                  },
                }}
                >{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length ? (
          // completed
          <div className={styles.stepsContainer}>
            <img src={researchImage} className={styles.stepsImage} />
            <h1>All steps completed</h1>
            <p className={styles.stepsDescription}>CoreComp is ready to serve!</p>
            <div style={{ width: "100%", display: "flex", justifyContent: "end" }}>
              <Button onClick={handleReset} sx={{ backgroundColor: "#DAD7CD", color: "#344E41" }}>Start Over</Button>
            </div>
          </div>
        ) : (
          <div className={styles.stepsContainer}>
            <Grow
              in={true}
              key={activeStep}
            >
              <img src={steps[activeStep].image} className={styles.stepsImage} />
            </Grow>
            <h1>{steps[activeStep].label}</h1>
            <p className={styles.stepsDescription}>{steps[activeStep].description}</p>
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", width: "100%" }}>
              <Button onClick={handleBack} disabled={activeStep === 0} sx={{ color: "#DAD7CD" }}>Back</Button>
              <Button
                onClick={handleNext}
                sx={{ backgroundColor: "#588157", color: "#DAD7CD" }}
              >
                {activeStep === steps.length - 1 ? "complete" : "next"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
