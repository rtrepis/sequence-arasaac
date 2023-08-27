import { Box, SpeedDial, SpeedDialAction } from "@mui/material";
import { FaCopyright } from "react-icons/fa";

const CopyRightSpeedDial = (): JSX.Element => {
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
        }}
      >
        <SpeedDialAction
          key={"arasaac"}
          icon={<img src="/img/arasaac/ara-saac-logo.svg" alt="araSaac" />}
          tooltipTitle={
            "Author of the pictograms: Sergio Palao.\n Origen: ARASAAC (http://www.arasaac.org). License: CC (BY-NC-SA)."
          }
          onClick={() => window.location.replace("https://www.arasaac.org")}
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
          icon={<img src="/img/logo.svg" alt="SeqSaac" height={20} />}
          tooltipTitle={`All right reserved: seqsaac@gmail.com,\n Ramon Trepat`}
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
