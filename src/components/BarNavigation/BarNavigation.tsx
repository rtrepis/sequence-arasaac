import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Container from "@mui/material/Container";
import Slide from "@mui/material/Slide";
import DefaultSettings from "../../Modals/DefaultSettingsModal/DefaultSettingsModal";
import { FormattedMessage } from "react-intl";
import messages from "./BarNavigation.lang";
import { Stack } from "@mui/material";
import NotPrint from "../NotPrint/NotPrint";
import ToggleButtonEditViewPages from "../ToggleButtonEditViewPages/ToggleButtonEditViewPages";
import PictogramAmount from "../PictogramAmount/PictogramAmount";
import MagicSearch from "../MagicSearch/MagicSearch";

interface BarProps {
  children: React.ReactElement;
  title?: "view" | "edit";
}

const HideOnScroll = (props: BarProps) => {
  const { children } = props;

  const trigger = useScrollTrigger({
    target: undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

const BarNavigation = (props: BarProps): JSX.Element => {
  return (
    <>
      <NotPrint>
        <HideOnScroll {...props}>
          <AppBar>
            <Toolbar
              sx={{ fontSize: "1.75rem", justifyContent: "space-between" }}
            >
              <Typography variant={"h6"} component="h1">
                <FormattedMessage {...messages.title} />
              </Typography>
              <Typography variant={"h5"} component="h2">
                {props.title && <FormattedMessage {...messages[props.title]} />}
              </Typography>
              <Stack direction={"row"}>
                {props.title && (
                  <ToggleButtonEditViewPages pageTitle={props.title} />
                )}
                {!props.title && (
                  <Stack display={{ xs: "none", lg: "flex" }} direction={"row"}>
                    <PictogramAmount variant="navBar" />
                    <MagicSearch variant="navBar" />
                  </Stack>
                )}
                <DefaultSettings />
              </Stack>
            </Toolbar>
          </AppBar>
        </HideOnScroll>
        <Toolbar />
      </NotPrint>
      <Container maxWidth={"xl"}>{props.children}</Container>
    </>
  );
};

export default BarNavigation;
