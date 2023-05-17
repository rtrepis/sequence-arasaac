import { Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";

interface CopyRightProps {
  producedBy: string;
}

const CopyRight = ({ producedBy }: CopyRightProps): JSX.Element => {
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
        defaultMessage="Made with: SequenceSaac - Author of the pictograms: Sergio Palao. Origen: ARASAAC
      (http://www.arasaac.org). License: CC (BY-NC-SA). produced by:"
        description={"License to use the pictograms"}
      />
      {producedBy}
    </Typography>
  );
};

export default CopyRight;
