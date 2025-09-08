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
import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import NotPrint from "../utils/NotPrint/NotPrint";
import { AiFillPrinter, AiOutlineFullscreen } from "react-icons/ai";
import { MdScreenRotation } from "react-icons/md";
import { ViewSettings } from "../../types/ui";
import { viewSettingsActionCreator } from "../../app/slice/uiSlice";
import { FormattedMessage, useIntl } from "react-intl";
import messages from "./ViewSequencesSettings.lang";
import useWindowResize from "../../hooks/useWindowResize";
import React from "react";
import { trackEvent } from "/src/hooks/usePageTracking";

interface ViewSequencesSettingsProps {
  children: React.ReactElement | React.ReactElement[];
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
}: ViewSequencesSettingsProps): React.ReactElement => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [screenWidth, screenHeight] = useWindowResize();
  const [isLandscape, setIsLandscape] = useState(true);
  const [sizePage, setSizePage] = useState(0);

  const [fullScreenWidth, fullScreenHeight] = [
    window.screen.width,
    window.screen.height,
  ];

  const initialStateConfigs = {
    marginAndScrollBar: [65, 380],
    widthLandScape: [975, 1450, fullScreenWidth],
    heightLandScape: [689, 1025, fullScreenHeight],
  };

  const [configsView] = useState(initialStateConfigs);

  const maxDisplay = useCallback(() => {
    const sizeMD = screenWidth > 900 ? 1 : 0;

    let width;
    let height;

    if (isLandscape) {
      width = screenWidth - configsView.marginAndScrollBar[sizeMD];
      height =
        (configsView.heightLandScape[sizePage] * width) /
        configsView.widthLandScape[sizePage];
    } else {
      width = screenHeight - configsView.marginAndScrollBar[sizeMD];
      height =
        (configsView.widthLandScape[sizePage] * width) /
        configsView.heightLandScape[sizePage];
    }

    const spaceToFoot = 150;
    if (height + spaceToFoot > screenHeight)
      if (isLandscape) {
        height = screenHeight - spaceToFoot;
        width =
          (configsView.widthLandScape[sizePage] * height) /
          configsView.heightLandScape[sizePage];
      } else {
        width = screenWidth - configsView.marginAndScrollBar[sizeMD];
        height =
          (configsView.widthLandScape[sizePage] * width) /
          configsView.heightLandScape[sizePage];
      }

    return [width, height];
  }, [
    configsView.heightLandScape,
    configsView.marginAndScrollBar,
    configsView.widthLandScape,
    isLandscape,
    screenHeight,
    screenWidth,
    sizePage,
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlerView = (event: any, value: number | number[]) => {
    const target = event.target;

    if (target !== null) {
      const newView: ViewSettings = {
        ...view,
        [target.name]: value,
      };

      setView(newView);
    }
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
    configsView.widthLandScape[sizePage],
    configsView.heightLandScape[sizePage],
  ]);

  const handlerChange = (event: SyntheticEvent, newValue: number) => {
    setSizePage(newValue);
  };

  const [displayFullScreen, setDisplayFullScreen] = useState(false);
  const fullScreen = async () => {
    const display = document.querySelector(".displayFullScreen");
    await display?.setAttribute("style", `display: flex`);

    await display?.requestFullscreen();
    setDisplayFullScreen(true);

    trackEvent({
      event: "full-screen-view",
      event_category: "View",
      event_label: "Full Screen",
      value: `sizePict_${view.sizePict}`,
    });
  };

  useEffect(() => {
    if (isLandscape) {
      setPrintWD([
        configsView.widthLandScape[sizePage],
        configsView.heightLandScape[sizePage],
      ]);
    }

    if (!isLandscape) {
      setPrintWD([
        configsView.heightLandScape[sizePage],
        configsView.widthLandScape[sizePage],
      ]);
    }

    const display = document.querySelector(".displayFullScreen");

    if (document.fullscreenElement === null) {
      setScale(maxDisplay()[0] / (printWH[0] + 24));

      if (displayFullScreen) {
        display?.setAttribute("style", "display: none");
        setDisplayFullScreen(false);
      }
    }
    if (document.fullscreenElement === display) {
      setScale(0.82);
    }
  }, [
    displayFullScreen,
    isLandscape,
    maxDisplay,
    setScale,
    sizePage,
    setDisplayFullScreen,
    configsView.widthLandScape,
    configsView.heightLandScape,
  ]);

  return (
    <>
      <form onBlur={handlerBlur} onSubmit={(event) => event.preventDefault()}>
        <NotPrint>
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"end"}
          >
            <Tabs
              value={sizePage}
              onChange={handlerChange}
              aria-label="pageSize"
            >
              <Tab label="A4" sx={{ fontWeight: "700" }} />
              <Tab label="A3" sx={{ fontWeight: "700" }} />
              <Tab label="Full Screen" sx={{ fontWeight: "700" }} />
            </Tabs>
            <Stack direction={"row"}>
              {sizePage < 2 ? (
                <>
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
                    onClick={() => {
                      window.print();

                      trackEvent({
                        event: "click-print-view",
                        event_category: "View",
                        event_label: "Print view",
                        value: `${"size_" + view.sizePict}`,
                      });
                    }}
                  >
                    <AiFillPrinter />
                  </Button>
                </>
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
                    step={0.01}
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
          {`${maxDisplay()[0] / (printWH[0] + 24)}`} -----{" "}
          {`${(printWH[1] + 24) / maxDisplay()[1]}`}
        </Stack>
        <Stack sx={{ display: "none" }}>
          size:{sizePage}---- height:{configsView.widthLandScape[2]},--- width:
          {configsView.heightLandScape[2]}
        </Stack>
      </form>
      <Stack
        className="displayFullScreen"
        direction={"row"}
        flexWrap={"wrap"}
        alignContent={"start"}
        alignItems={"start"}
        columnGap={view.columnGap}
        rowGap={view.rowGap}
        overflow={"hidden"}
        padding={2}
        display={"none"}
      >
        {children}
      </Stack>
    </>
  );
};

export default ViewSequencesSettings;
