import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import { AiOutlineCopy, AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { MdOutlineContentPaste, MdOutlineLibraryAdd } from "react-icons/md";
import { TbColumnInsertRight } from "react-icons/tb";
import { useIntl } from "react-intl";
import { PictSequence } from "../../../types/sequence";
import messages from "./MouseActionList.lang";
import {
  usePictogramActions,
  type PictogramActionKey,
} from "./usePictogramActions";
import React from "react";

interface MouseActionListProps {
  pictogram: PictSequence;
  editAction: () => void;
  closeAction: () => void;
  copyAction: React.Dispatch<React.SetStateAction<PictSequence>> | undefined;
  pasteObject: PictSequence | undefined;
  /** Accions que el context que consumeix la llista ja ofereix pel seu compte */
  omit?: PictogramActionKey[];
  /**
   * Si es passa, la llista no executa res: només diu quina acció s'ha triat.
   * Serveix al diàleg d'edició, que ha d'ajornar-la fins després de tancar-se
   * perquè el formulari hi desa els seus canvis en sortir.
   */
  onSelect?: (action: PictogramActionKey) => void;
}

/** Ordre i aspecte de cada acció; l'ordre és el que veu l'usuari */
const actionItems: Array<{
  key: PictogramActionKey;
  icon: React.ReactElement;
  message: keyof typeof messages;
}> = [
  { key: "copy", icon: <AiOutlineCopy />, message: "copy" },
  // Porta-retalls: la contrapartida de la còpia. El clip de paper d'abans és
  // el símbol universal d'«adjuntar fitxer», no d'enganxar
  { key: "paste", icon: <MdOutlineContentPaste />, message: "paste" },
  { key: "edit", icon: <AiOutlineEdit />, message: "edit" },
  { key: "delete", icon: <AiOutlineDelete />, message: "delete" },
  { key: "insert", icon: <TbColumnInsertRight />, message: "insert" },
  // Còpies apilades amb «+»: duplicar afegeix un pictograma a la seqüència,
  // mentre que copiar (dos fulls) no la toca. El «+» és el senyal compartit
  // amb «Insereix buit»
  { key: "duplicate", icon: <MdOutlineLibraryAdd />, message: "duplicate" },
];

const MouseActionList = ({
  pictogram,
  editAction,
  closeAction,
  copyAction,
  pasteObject,
  omit = [],
  onSelect,
}: MouseActionListProps): React.ReactElement => {
  const intl = useIntl();
  const actions = usePictogramActions({
    pictogram,
    editAction,
    copyAction,
    pasteObject,
  });

  const handlerSelect = (action: PictogramActionKey) => {
    closeAction();
    if (onSelect) return onSelect(action);
    actions[action]();
  };

  // Id propi de cada pictograma: la llista es pot muntar des del menú
  // contextual o des del diàleg, i dos ids iguals al DOM deixarien la llista
  // sense nom accessible fiable
  const subheaderId = `pictogram-actions-${pictogram.indexSequence}`;

  return (
    <List
      sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
      component="nav"
      aria-labelledby={subheaderId}
      subheader={
        <ListSubheader component="span" id={subheaderId} color="primary">
          {intl.formatMessage(messages.header, {
            number: pictogram.indexSequence + 1,
          })}
        </ListSubheader>
      }
    >
      {actionItems
        .filter(({ key }) => !omit.includes(key))
        .map(({ key, icon, message }) => (
          <ListItemButton
            key={key}
            // Enganxar sense res copiat no té cap efecte possible
            disabled={key === "paste" && !pasteObject}
            onClick={() => handlerSelect(key)}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={intl.formatMessage(messages[message])} />
          </ListItemButton>
        ))}
    </List>
  );
};

export default MouseActionList;
