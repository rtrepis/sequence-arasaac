import {
  Box,
  Button,
  Divider,
  FormGroup,
  FormLabel,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAppDispatch } from "../../app/hooks";
import { useState } from "react";
import NotPrint from "../utils/NotPrint/NotPrint";
import { AiFillPrinter } from "react-icons/ai";
import { MdScreenRotation } from "react-icons/md";
import { ViewSettings } from "../../types/ui";
import { viewSettingsActionCreator } from "../../app/slice/uiSlice";
import { FormattedMessage } from "react-intl";
import messages from "./ViewSequencesSettings.lang";
import { tab } from "./ViewSequenceSettings.styled";

interface ViewSequencesSettingsProps {
  children: JSX.Element | JSX.Element[];
  view: ViewSettings;
  setView: React.Dispatch<React.SetStateAction<ViewSettings>>;
  printPageRatio?: number;
  producedBy?: string;
  setProducedBy?: React.Dispatch<React.SetStateAction<string>>;
}

const ViewSequencesSettings = ({
  children,
  view,
  setView,
  printPageRatio,
  producedBy,
  setProducedBy,
}: ViewSequencesSettingsProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const [isLandscape, setIsLandscape] = useState(true);

  const handlerView = (event: any, value: number | number[]) => {
    const newView: ViewSettings = {
      ...view,
      [event.target.name]: value,
    };

    setView(newView);
  };

  const handlerBlur = () => {
    const newViewSettings: ViewSettings = {
      sizePict: view.sizePict,
      columnGap: view.columnGap,
      rowGap: view.rowGap,
    };

    dispatch(viewSettingsActionCreator(newViewSettings));
    setView(newViewSettings);
  };

  const ratioPrint = printPageRatio ? printPageRatio : 1;

  return (
    <>
      <form onBlur={handlerBlur} onSubmit={(event) => event.preventDefault()}>
        <NotPrint>
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"end"}
            paddingTop={2}
          >
            <Box sx={tab}>
              <Typography color={"primary.contrastText"}>A4</Typography>
            </Box>
            <Stack direction={"row"}>
              <Button
                aria-label={"page orientation"}
                variant="text"
                color="primary"
                sx={{ fontSize: "2rem" }}
                onClick={() => setIsLandscape(!isLandscape)}
              >
                <MdScreenRotation />
              </Button>
              <Button
                aria-label={"view"}
                variant="text"
                color="primary"
                sx={{ fontSize: "2rem" }}
                onClick={() => window.print()}
              >
                <AiFillPrinter />
              </Button>
            </Stack>
          </Stack>
        </NotPrint>
        <Stack direction={{ xs: "column", md: "row" }} columnGap={3}>
          <Stack
            direction={"row"}
            flexWrap={"wrap"}
            alignContent={"start"}
            alignItems={"start"}
            columnGap={view.columnGap * ratioPrint}
            rowGap={view.rowGap * ratioPrint}
            width={isLandscape ? 1060 * ratioPrint : 750 * ratioPrint}
            height={isLandscape ? 750 * ratioPrint : 1060 * ratioPrint}
            overflow={"hidden"}
            sx={{
              border: "2px solid green",
              padding: 2,
              marginBottom: 3,
              "@media print": {
                "@page": {
                  size: `A4 ${isLandscape ? "landscape" : "portrait"}`,
                },
                border: "none",
                padding: 0,
                marginBottom: 0,
                width: `${isLandscape ? 1069 : 720}px`,
                height: `${isLandscape ? 720 : 1060}px`,
                columnGap: view.columnGap,
                rowGap: view.rowGap,
              },
            }}
          >
            {children}
          </Stack>
          <NotPrint>
            <Divider orientation="vertical" />
          </NotPrint>
          <NotPrint>
            <Stack columnGap={2} maxWidth={300} paddingLeft={2}>
              <FormGroup>
                <FormLabel>
                  <FormattedMessage {...messages.size} />
                  <Slider
                    defaultValue={view.sizePict}
                    name="sizePict"
                    step={0.05}
                    min={0.5}
                    max={2}
                    value={view.sizePict}
                    onChange={handlerView}
                  />
                </FormLabel>
              </FormGroup>
              <FormGroup>
                <FormLabel>
                  <FormattedMessage {...messages.columnGap} />
                  <Slider
                    name="columnGap"
                    step={0.5}
                    min={-2}
                    max={10}
                    value={view.columnGap}
                    onChange={handlerView}
                  />
                </FormLabel>
              </FormGroup>
              <FormGroup>
                <FormLabel>
                  <FormattedMessage {...messages.rowGap} />
                  <Slider
                    name="rowGap"
                    step={0.5}
                    min={0}
                    max={10}
                    value={view.rowGap}
                    onChange={handlerView}
                  />
                </FormLabel>
              </FormGroup>
              {setProducedBy && (
                <FormGroup>
                  <FormLabel>
                    Produced by:
                    <TextField
                      value={producedBy}
                      onChange={(event) => setProducedBy(event.target.value)}
                      variant="filled"
                      fullWidth
                      helperText={"Mark authorship"}
                      sx={{
                        ".MuiInputBase-input": { paddingTop: 2 },
                      }}
                    />
                  </FormLabel>
                </FormGroup>
              )}
            </Stack>
          </NotPrint>
        </Stack>
      </form>
    </>
  );
};

export default ViewSequencesSettings;
