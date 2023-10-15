import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import DefaultForm from "../DefaultsForm/DefaultForm";
import { Container, Stack } from "@mui/material";
import PictogramAmount from "../PictogramAmount/PictogramAmount";
import MagicSearch from "../MagicSearch/MagicSearch";
import PictEditModalList from "../../Modals/PictEditModalList/PictEditModalList";
import { useAppSelector } from "../../app/hooks";

const steps = ["Introduction", "Prettier pictogram", "Make Sequence", "Print"];

export default function HorizontalLinearStepper() {
  const sequence = useAppSelector((state) => state.sequence);
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  return (
    <Container sx={{ paddingBlock: 1 }}>
      <Stepper activeStep={activeStep}>
        {steps.map((step) => (
          <Step key={step}>
            <StepLabel>{step}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <>
        <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
        {activeStep === 1 && (
          <DefaultForm submit={activeStep === 1}></DefaultForm>
        )}

        {activeStep === 2 && (
          <>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              marginTop={2}
              justifyContent={"space-around"}
            >
              <PictogramAmount />
              <MagicSearch />
            </Stack>
            <PictEditModalList sequence={sequence} />
          </>
        )}

        <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: "1 1 auto" }} />
          <Button
            onClick={handleNext}
            disabled={activeStep === steps.length - 1}
          >
            {activeStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </Box>
      </>
    </Container>
  );
}
