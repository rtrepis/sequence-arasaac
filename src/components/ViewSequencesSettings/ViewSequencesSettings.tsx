import {
  Button,
  Divider,
  FormGroup,
  FormLabel,
  Slider,
  Stack,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { useAppDispatch } from "../../app/hooks";
import { SyntheticEvent, useEffect, useState } from "react";
import NotPrint from "../utils/NotPrint/NotPrint";
import { AiFillPrinter, AiOutlineFullscreen } from "react-icons/ai";
import { MdScreenRotation } from "react-icons/md";
import { ViewSettings } from "../../types/ui";
import { viewSettingsActionCreator } from "../../app/slice/uiSlice";
import { FormattedMessage, useIntl } from "react-intl";
import messages from "./ViewSequencesSettings.lang";
import useWindowResize from "../../hooks/useWindowResize";

interface ViewSequencesSettingsProps {
  children: JSX.Element | JSX.Element[];
  view: ViewSettings;
  setView: React.Dispatch<React.SetStateAction<ViewSettings>>;
  author?: string;
  setAuthor?: React.Dispatch<React.SetStateAction<string>>;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
}

const ViewSequencesSettings = ({
  children,
  view,
  setView,
  scale,
  setScale,
  author,
  setAuthor,
}: ViewSequencesSettingsProps): JSX.Element => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [screenWidth, screenHeight] = useWindowResize();
  const [isLandscape, setIsLandscape] = useState(true);
  const [sizePage, setSizePage] = useState(0);

  const marginAndScrollBar = [65, 380];
  const [fullScreenWidth, fullScreenHeight] = [
    window.screen.width,
    window.screen.height,
  ];

  const widthLandScape = [975, 1450, fullScreenWidth];
  const heightLandScape = [689, 1025, fullScreenHeight];

  const maxDisplay = () => {
    const sizeMD = screenWidth > 900 ? 1 : 0;

    let width;
    let height;

    if (isLandscape) {
      width = screenWidth - marginAndScrollBar[sizeMD];
      height = (heightLandScape[sizePage] * width) / widthLandScape[sizePage];
    } else {
      width = screenHeight - marginAndScrollBar[sizeMD];
      height = (widthLandScape[sizePage] * width) / heightLandScape[sizePage];
    }

    const spaceToFoot = 100;
    if (height + spaceToFoot > screenHeight)
      if (isLandscape) {
        height = screenHeight - spaceToFoot;
        width = (widthLandScape[sizePage] * height) / heightLandScape[sizePage];
      } else {
        height = screenHeight - spaceToFoot;
        width = (heightLandScape[sizePage] * height) / widthLandScape[sizePage];
      }

    return [width, height];
  };

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

  const [printWH, setPrintWD] = useState([
    widthLandScape[sizePage],
    heightLandScape[sizePage],
  ]);

  const handlerChange = (event: SyntheticEvent, newValue: number) => {
    setSizePage(newValue);
  };

  const fullScreen = () => {
    const display = document.querySelector(".display");

    display?.requestFullscreen();
  };

  useEffect(() => {
    if (isLandscape) {
      setPrintWD([widthLandScape[sizePage], heightLandScape[sizePage]]);
    }

    if (!isLandscape) {
      setPrintWD([heightLandScape[sizePage], widthLandScape[sizePage]]);
    }

    if (sizePage < 2) {
      setScale(maxDisplay()[0] / (printWH[0] + 24));
    }
  }, [
    heightLandScape,
    isLandscape,
    maxDisplay,
    printWH,
    setScale,
    sizePage,
    widthLandScape,
  ]);

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
            <Tabs
              value={sizePage}
              onChange={handlerChange}
              aria-label="pageSize"
            >
              <Tab label="A4" sx={{ fontWeight: "700" }} />
              <Tab label="A3" sx={{ fontWeight: "700" }} />
            </Tabs>
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
              {sizePage < 2 ? (
                <Button
                  aria-label={"view"}
                  variant="text"
                  color="primary"
                  sx={{ fontSize: "2rem" }}
                  onClick={() => window.print()}
                >
                  <AiFillPrinter />
                </Button>
              ) : (
                <Button
                  aria-label={"fullScreen"}
                  variant="text"
                  color="primary"
                  sx={{ fontSize: "2rem" }}
                  onClick={fullScreen}
                >
                  <AiOutlineFullscreen />
                </Button>
              )}
            </Stack>
          </Stack>
        </NotPrint>
        <Stack direction={{ xs: "column", md: "row" }} columnGap={3}>
          <Stack
            className="display"
            direction={"row"}
            flexWrap={"wrap"}
            alignContent={"start"}
            alignItems={"start"}
            columnGap={view.columnGap * scale}
            rowGap={view.rowGap * scale}
            width={maxDisplay()[0]}
            height={maxDisplay()[1]}
            overflow={"hidden"}
            sx={{
              border: "2px solid green",
              padding: 2,
              marginBottom: 3,
              "@media print": {
                "@page": {
                  size: `${sizePage === 0 ? "A4 " : "A3 "} ${
                    isLandscape ? "landscape" : "portrait"
                  }`,
                },
                border: "none",
                padding: 0,
                marginBottom: 0,
                width: `${printWH[0]}px`,
                height: `${printWH[1]}px`,
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
              {setAuthor && (
                <FormGroup>
                  <FormLabel>
                    <FormattedMessage {...messages.authSequence} />
                    <TextField
                      value={author}
                      onChange={(event) => setAuthor(event.target.value)}
                      variant="filled"
                      fullWidth
                      helperText={intl.formatMessage({
                        ...messages.authHelperText,
                      })}
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
        <Stack sx={{ display: "none" }}>
          size:{sizePage}---- height:{printWH[1]}, {maxDisplay()[1]}---- width:{" "}
          {printWH[0]}, {maxDisplay()[0]}----landscape:{" "}
          {isLandscape ? "true" : "false"}-------
          {`${sizePage === 0 ? "A4" : "A3"}
        ${isLandscape ? "landscape" : "portrait"}`}{" "}
          {`${(printWH[0] + 24) / maxDisplay()[0]}`} -----{" "}
          {`${printWH[1] / maxDisplay()[1]}`}
        </Stack>
        <Stack sx={{ display: "none" }}>
          size:{sizePage}---- height:{widthLandScape[2]},--- width:
          {heightLandScape[2]}
        </Stack>
      </form>
    </>
  );
};

export default ViewSequencesSettings;
