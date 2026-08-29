import {
  Divider,
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

interface ActionItem {
  key: PictogramActionKey;
  icon: React.ReactElement;
  message: keyof typeof messages;
  /** Marca visual d'irreversible: text i icona en `error` */
  destructive?: boolean;
}

/**
 * Els grups són l'ordre que veu l'usuari, separats per un `Divider`:
 * el que fa servir més amunt, el que destrueix al capdavall i sol.
 *
 * «Esborra» estava encaixonat entre quatre accions inofensives i a un pas
 * d'«Edita», que és la que més es pitja. Com que `features/sequence` no té
 * `undo`, la distància i el color són tota la protecció que hi ha: aquí no
 * s'hi posa confirmació a propòsit, perquè treure un pictograma es repeteix
 * molt i es refà amb un clic —a diferència d'esborrar una seqüència sencera,
 * que sí que la demana.
 */
const actionGroups: ActionItem[][] = [
  [{ key: "edit", icon: <AiOutlineEdit />, message: "edit" }],
  [
    { key: "copy", icon: <AiOutlineCopy />, message: "copy" },
    // Porta-retalls: la contrapartida de la còpia. El clip de paper d'abans és
    // el símbol universal d'«adjuntar fitxer», no d'enganxar
    { key: "paste", icon: <MdOutlineContentPaste />, message: "paste" },
  ],
  [
    { key: "insert", icon: <TbColumnInsertRight />, message: "insert" },
    // Còpies apilades amb «+»: duplicar afegeix un pictograma a la seqüència,
    // mentre que copiar (dos fulls) no la toca. El «+» és el senyal compartit
    // amb «Insereix buit»
    { key: "duplicate", icon: <MdOutlineLibraryAdd />, message: "duplicate" },
  ],
  [
    {
      key: "delete",
      icon: <AiOutlineDelete />,
      message: "delete",
      destructive: true,
    },
  ],
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
        // Sense `color="primary"`: en verd es quedava a 2,1:1 sobre el paper del
        // menú, i el gris per defecte del subheader és el que li toca a un rètol
        // que diu sobre què són les accions
        <ListSubheader component="span" id={subheaderId}>
          {intl.formatMessage(messages.header, {
            number: pictogram.indexSequence + 1,
          })}
        </ListSubheader>
      }
    >
      {actionGroups
        .map((group) => group.filter(({ key }) => !omit.includes(key)))
        // Un grup que es queda buit per `omit` no ha de deixar cap separador
        .filter((group) => group.length > 0)
        .map((group, groupIndex) => (
          <React.Fragment key={group[0].key}>
            {groupIndex > 0 && <Divider component="li" />}
            {group.map(({ key, icon, message, destructive }) => (
              <ListItemButton
                key={key}
                // Enganxar sense res copiat no té cap efecte possible
                disabled={key === "paste" && !pasteObject}
                onClick={() => handlerSelect(key)}
                sx={destructive ? { color: "error.main" } : undefined}
              >
                <ListItemIcon
                  sx={destructive ? { color: "error.main" } : undefined}
                >
                  {icon}
                </ListItemIcon>
                <ListItemText primary={intl.formatMessage(messages[message])} />
              </ListItemButton>
            ))}
          </React.Fragment>
        ))}
    </List>
  );
};

export default MouseActionList;
