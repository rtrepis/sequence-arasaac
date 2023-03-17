import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import CssBaseline from "@mui/material/CssBaseline";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Container from "@mui/material/Container";
import Slide from "@mui/material/Slide";
import SettingsDefaultCardList from "../SettingDefaultCardList/SettingDefaultCardList";

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
  return (
    <>
      <CssBaseline />
      <HideOnScroll {...props}>
        <AppBar>
          <Toolbar
            sx={{ fontSize: "1.75rem", justifyContent: "space-between" }}
          >
            <Typography variant="h6" component="h1">
              Sequences - AraSaac
            </Typography>
            <SettingsDefaultCardList />
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar />
      <Container maxWidth={"xl"}>{props.children}</Container>
    </>
  );
};

export default BarNavigation;
