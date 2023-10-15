import { Container, Typography } from "@mui/material";

const Footer = (): JSX.Element => {
  return (
    <Container sx={{ display: "sticky", position: "absolute", bottom: 0 }}>
      <img src="/img/arasaac/ara-saac-logo.svg" alt="araSaac" height={20} />
      <Typography variant="body2" padding={1}>
        Author of the pictograms: Sergio Palao.\n Origen: ARASAAC
        (http://www.arasaac.org). License: CC (BY-NC-SA).{" "}
      </Typography>
      <img src="/img/logo.svg" alt="SeqSaac" height={20} />
      <Typography variant="body2">
        All right reserved: seqsaac@gmail.com, Ramon Trepat
      </Typography>
    </Container>
  );
};

export default Footer;
