import { Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";

const CopyRight = (): JSX.Element => {
  return (
    <Typography
      component={"p"}
      fontSize={10}
      sx={{
        display: "none",
        position: "fixed",
        bottom: 10,
        "@media print": { display: "block" },
      }}
    >
      <FormattedMessage
        id="components.copyRight"
        defaultMessage="
      Author of the pictograms: Sergio Palao. Origen: ARASAAC
      (http://www.arasaac.org). License: CC (BY-NC-SA). Owner: Govern d'Aragó
      (Espanya)"
        description={"License to use the pictograms"}
      />
    </Typography>
  );
};

export default CopyRight;
