import { Box, SpeedDial, SpeedDialAction } from "@mui/material";
import { FaCopyright } from "react-icons/fa";
import { useIntl } from "react-intl";
import messages from "./CopyRightSpeedDial.lang";

const CopyRightSpeedDial = (): JSX.Element => {
  const intl = useIntl();

  return (
    <Box position={"fixed"} height={2} width={"100%"} bottom={0} zIndex={1}>
      <SpeedDial
        ariaLabel="Copyright"
        hidden={false}
        icon={<FaCopyright />}
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          ".MuiSpeedDial-fab": { width: 36, height: 36 },
        }}
      >
        <SpeedDialAction
          key={"arasaac"}
          icon={<img src="../img/arasaac/ara-saac-logo.svg" alt="araSaac" />}
          tooltipTitle={intl.formatMessage(messages.license)}
          onClick={() =>
            window.location.replace("https://www.arasaac.org/terms-of-use")
          }
          tooltipOpen
          sx={{
            ".MuiSpeedDialAction-staticTooltipLabel": {
              width: 300,
              fontSize: 10,
            },
          }}
        />
        <SpeedDialAction
          key={"SeqSaac"}
          icon={<img src="../img/logo.svg" alt="SeqSaac" height={20} />}
          tooltipTitle={intl.formatMessage(messages.auth)}
          tooltipOpen
          sx={{
            ".MuiSpeedDialAction-staticTooltipLabel": {
              width: 300,
              fontSize: 10,
            },
          }}
        />
      </SpeedDial>
    </Box>
  );
};

export default CopyRightSpeedDial;
