import { IconButton, Tooltip } from "@mui/material";
import { AiOutlineCloudDownload } from "react-icons/ai";
import { useIntl } from "react-intl";
import React, { useState } from "react";
import messages from "./ButtonWithModalDonwload.lang";
import ModalDownload from "./ModalDownload";

const ButtonWithModalDownload = (): React.ReactElement => {
  const intl = useIntl();

  const [openModal, setOpenModal] = useState(false);

  const onClick = () => {
    setOpenModal(true);
  };

  return (
    <>
      <Tooltip title={intl.formatMessage(messages.download)}>
        <IconButton
          color="secondary"
          onClick={onClick}
          aria-label={intl.formatMessage(messages.download)}
        >
          <AiOutlineCloudDownload />
        </IconButton>
      </Tooltip>

      {openModal && (
        <ModalDownload open={openModal} onClose={() => setOpenModal(false)} />
      )}
    </>
  );
};

export default ButtonWithModalDownload;
