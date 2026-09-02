// Camp de contrasenya amb l'ull per veure el que s'escriu.
//
// **Només un camp destapat alhora**, i garantit per construcció: la visibilitat
// no viu a cada camp sinó al grup (`PasswordVisibilityGroup`), que en recorda
// un de sol. Amb un booleà per camp, res no impediria tenir la contrasenya i la
// seva repetició destapades a la vegada, i aleshores el segon camp deixa de
// comprovar res: es copia amb els ulls en comptes d'escriure's.
//
// L'ull hi és perquè una contrasenya de deu caràcters amb majúscules i xifres
// és exactament la que més s'equivoca a cegues, i en una tauleta —el dispositiu
// típic de qui fa servir AAC— el teclat no dona cap altra pista.
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  InputAdornment,
  TextField,
  TextFieldProps,
  Tooltip,
} from "@mui/material";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useIntl } from "react-intl";
import StyledIconButton from "@/style/StyledIconButton";
import messages from "./PasswordField.lang";

interface PasswordVisibilityContextValue {
  /** Nom del camp destapat ara mateix, o null si no n'hi ha cap. */
  revealed: string | null;
  /** Destapa aquest camp i, amb ell, tapa el que hi hagués destapat. */
  toggle: (name: string) => void;
}

const PasswordVisibilityContext =
  createContext<PasswordVisibilityContextValue | null>(null);

/**
 * Embolcalla els camps de contrasenya d'un formulari. Cal que hi siguin tots
 * dins: és qui garanteix que només se'n vegi un.
 */
export const PasswordVisibilityGroup = ({
  children,
}: {
  children: ReactNode;
}): React.ReactElement => {
  const [revealed, setRevealed] = useState<string | null>(null);

  const toggle = useCallback((name: string) => {
    setRevealed((current) => (current === name ? null : name));
  }, []);

  const value = useMemo(() => ({ revealed, toggle }), [revealed, toggle]);

  return (
    <PasswordVisibilityContext.Provider value={value}>
      {children}
    </PasswordVisibilityContext.Provider>
  );
};

type PasswordFieldProps = Omit<TextFieldProps, "type" | "InputProps"> & {
  /** Identifica el camp dins del grup. No es dibuixa enlloc. */
  name: string;
};

const PasswordField = ({
  name,
  ...textFieldProps
}: PasswordFieldProps): React.ReactElement => {
  const intl = useIntl();
  const group = useContext(PasswordVisibilityContext);

  if (!group) {
    throw new Error(
      "PasswordField ha d'anar dins d'un PasswordVisibilityGroup: és qui impedeix que dos camps quedin destapats alhora",
    );
  }

  const isRevealed = group.revealed === name;
  const label = intl.formatMessage(isRevealed ? messages.hide : messages.show);

  return (
    <TextField
      {...textFieldProps}
      name={name}
      type={isRevealed ? "text" : "password"}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {/* En un botó només-icona el tooltip **és** el nom accessible, i per
                això no porta describeChild: no hi ha cap etiqueta visible que
                pugui tapar */}
            <Tooltip title={label}>
              <StyledIconButton
                onClick={() => group.toggle(name)}
                color="inherit"
                edge="end"
                // El botó diu si la contrasenya es veu ara mateix; sense això,
                // qui el llegeix amb un lector de pantalla no sap en quin dels
                // dos estats és
                aria-pressed={isRevealed}
                aria-label={label}
              >
                {isRevealed ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </StyledIconButton>
            </Tooltip>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default PasswordField;
