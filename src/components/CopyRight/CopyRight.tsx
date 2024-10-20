import { Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";
import React from "react";

interface CopyRightProps {
  author: string;
}

const CopyRight = ({ author }: CopyRightProps): React.ReactElement => {
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
        defaultMessage="Made with: SequenciAAC - Author of the pictograms: Sergio Palao. Origen: ARASAAC
      (http://www.arasaac.org). License: CC (BY-NC-SA)."
        description="License to use the pictograms"
      />{" "}
      {author.trim().length !== 0 && (
        <FormattedMessage
          id="components.sequenceAuthor"
          defaultMessage="Sequence author:"
          description="License to use the pictograms"
        />
      )}{" "}
      {author}
    </Typography>
  );
};

export default CopyRight;
