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
import { useDispatch } from "react-redux";
import { viewPageActionCreator } from "../../app/slice/uiSlice";
import { useState } from "react";

interface Props {
  children: React.ReactElement;
}

const HideOnScroll = (props: Props) => {
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

const BarNavigation = (props: Props) => {
  const dispatch = useDispatch();

  const [view, setView] = useState(false);

  const handlerView = () => {
    dispatch(viewPageActionCreator(!view));
    setView(!view);
  };

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
              {view && (
                <Typography variant={"h5"} component="h2">
                  <FormattedMessage {...messages.view} />
                </Typography>
              )}
              {!view && (
                <Typography variant={"h5"} component="h2">
                  <FormattedMessage {...messages.edit} />
                </Typography>
              )}
              <Stack direction={"row"}>
                {!view && (
                  <Button
                    aria-label={"view"}
                    variant="text"
                    color="secondary"
                    sx={{ fontSize: "2rem" }}
                    onClick={handlerView}
                  >
                    <AiOutlineEye />
                  </Button>
                )}
                {view && (
                  <Button
                    aria-label={"edit"}
                    variant="text"
                    color="secondary"
                    sx={{ fontSize: "2rem" }}
                    onClick={handlerView}
                  >
                    <AiOutlineEdit />
                  </Button>
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
