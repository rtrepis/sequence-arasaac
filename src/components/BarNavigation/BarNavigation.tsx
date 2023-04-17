import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Container from "@mui/material/Container";
import Slide from "@mui/material/Slide";
import DefaultSettings from "../DefaultSettings/DefaultSettings";
import { FormattedMessage } from "react-intl";
import messages from "./BarNavigation.lang";
import { Button, Stack } from "@mui/material";
import NotPrint from "../NotPrint/NotPrint";
import { AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router-dom";

interface BarProps {
  children: React.ReactElement;
  title: "view" | "edit";
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

const BarNavigation = (props: BarProps) => {
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
                <FormattedMessage {...messages[props.title]} />
              </Typography>
              <Stack direction={"row"}>
                {props.title === "edit" && (
                  <Link to={"../view-sequence"}>
                    <Button
                      aria-label={"view"}
                      variant="text"
                      color="secondary"
                      sx={{ fontSize: "2rem" }}
                    >
                      <AiOutlineEye />
                    </Button>
                  </Link>
                )}
                {props.title === "view" && (
                  <Link to={"../create-sequence"}>
                    <Button
                      aria-label={"edit"}
                      variant="text"
                      color="secondary"
                      sx={{ fontSize: "2rem" }}
                    >
                      <AiOutlineEdit />
                    </Button>
                  </Link>
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
