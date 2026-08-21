// Llista en viu dels requisits de la contrasenya.
//
// Reflecteix exactament les regles que valida el backend (setPasswordSchema):
// mostrar-ne una de diferent seria enganyar l'usuari sobre per què el formulari
// li ha rebutjat la contrasenya.
import React from "react";
import { Box, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { AiOutlineCheckCircle, AiOutlineMinusCircle } from "react-icons/ai";
import { useIntl } from "react-intl";
import messages from "./PasswordStrengthGuide.lang";

// react-icons no accepta strings de tema com "success.main": es passa el color
// via un contenidor amb sx (currentColor) en comptes d'una prop color directa.

export const PASSWORD_MIN_LENGTH = 10;

interface Requirement {
  labelId: keyof typeof messages;
  met: boolean;
}

// Exportat perquè el formulari pugui desactivar el botó d'enviar fins que
// es compleixin tots els requisits, sense repetir les mateixes expressions.
export const getPasswordRequirements = (password: string): Requirement[] => [
  { labelId: "minLength", met: password.length >= PASSWORD_MIN_LENGTH },
  { labelId: "hasLowercase", met: /[a-z]/.test(password) },
  { labelId: "hasUppercase", met: /[A-Z]/.test(password) },
  { labelId: "hasNumber", met: /[0-9]/.test(password) },
];

interface PasswordStrengthGuideProps {
  password: string;
}

const PasswordStrengthGuide = ({
  password,
}: PasswordStrengthGuideProps): React.ReactElement => {
  const intl = useIntl();
  const requirements = getPasswordRequirements(password);

  return (
    <Box component="ul" sx={{ m: 0, p: 0 }}>
      <List dense disablePadding aria-live="polite">
        {requirements.map(({ labelId, met }) => (
          <ListItem
            key={labelId}
            disableGutters
            disablePadding
            sx={{ py: 0.25 }}
          >
            <ListItemIcon
              sx={{
                minWidth: 28,
                color: met ? "success.main" : "text.secondary",
              }}
            >
              {met ? <AiOutlineCheckCircle /> : <AiOutlineMinusCircle />}
            </ListItemIcon>
            <ListItemText
              primary={intl.formatMessage(messages[labelId])}
              slotProps={{
                primary: {
                  variant: "body2",
                  sx: { color: met ? "success.main" : "text.secondary" },
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default PasswordStrengthGuide;
