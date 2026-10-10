import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import { AiOutlineCopy, AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import {
  MdOutlineContentPaste,
  MdOutlineLibraryAdd,
  MdOutlineTextFields,
  MdSettingsBackupRestore,
} from "react-icons/md";
import { TbColumnInsertRight } from "react-icons/tb";
import { useIntl } from "react-intl";
import { PictSequence } from "../../../types/sequence";
import messages from "./MouseActionList.lang";
import {
  usePictogramActions,
  type PictogramActionKey,
} from "./usePictogramActions";
import React from "react";
import usePictogramUrl from "@features/pictogram/hooks/usePictogramUrl";
import { sheetSurface } from "@/style/palette";

interface MouseActionListProps {
  pictogram: PictSequence;
  editAction: () => void;
  /**
   * Edita el text damunt de la targeta. Només si es passa hi ha «Edita el
   * text»: el diàleg ja té el seu camp, i sense text visible no hi ha on fer-ho
   */
  editTextAction?: () => void;
  closeAction: () => void;
  copyAction: React.Dispatch<React.SetStateAction<PictSequence>> | undefined;
  pasteObject: PictSequence | undefined;
  /** Accions que el context que consumeix la llista ja ofereix pel seu compte */
  omit?: PictogramActionKey[];
  /**
   * El pictograma té retocs propis: només llavors hi ha «Restableix l'estil».
   * Qui munta la llista ho sap millor (al diàleg, el formulari encara no desat)
   */
  customized?: boolean;
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
  [
    { key: "edit", icon: <AiOutlineEdit />, message: "edit" },
    // Només si qui munta la llista ho permet (vegeu `editTextAction`)
    { key: "editText", icon: <MdOutlineTextFields />, message: "editText" },
  ],
  [
    { key: "copy", icon: <AiOutlineCopy />, message: "copy" },
    // Porta-retalls: la contrapartida de la còpia. El clip de paper d'abans és
    // el símbol universal d'«adjuntar fitxer», no d'enganxar
    { key: "paste", icon: <MdOutlineContentPaste />, message: "paste" },
  ],
  // Només si el pictograma té retocs propis (vegeu `customized`)
  [
    {
      key: "resetStyle",
      icon: <MdSettingsBackupRestore />,
      message: "resetStyle",
    },
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
  editTextAction,
  closeAction,
  copyAction,
  pasteObject,
  omit = [],
  customized = false,
  onSelect,
}: MouseActionListProps): React.ReactElement => {
  const intl = useIntl();
  const { buildPictogramUrl } = usePictogramUrl();
  const actions = usePictogramActions({
    pictogram,
    editAction,
    editTextAction,
    copyAction,
    pasteObject,
  });

  // El porta-retalls es veu a la fila «Enganxa» (B8): què s'hi enganxarà, o
  // per què encara no es pot. Enganxar sense res copiat no té cap efecte
  const pasteEmpty = !pasteObject;
  const pasteText = pasteObject
    ? pasteObject.text || pasteObject.img.searched.word
    : "";
  const pasteHelp = pasteObject
    ? pasteText
      ? intl.formatMessage(messages.pasteSource, { text: pasteText })
      : intl.formatMessage(messages.pasteSourceNoText)
    : intl.formatMessage(messages.pasteEmpty);
  // La mateixa imatge que la targeta: la pròpia si n'hi ha (les `blob:` són
  // temporals i no valen), si no la d'ARASAAC amb la pell, el cabell i el color
  const pasteImage = pasteObject
    ? pasteObject.img.url && !pasteObject.img.url.startsWith("blob:")
      ? pasteObject.img.url
      : buildPictogramUrl(
          pasteObject.img.selectedId,
          pasteObject.img.settings.skin,
          pasteObject.img.settings.hair,
          pasteObject.img.settings.color,
        )
    : undefined;

  const handlerSelect = (action: PictogramActionKey) => {
    if (action === "paste" && pasteEmpty) return;
    closeAction();
    if (onSelect) return onSelect(action);
    actions[action]();
  };

  // Id propi de cada pictograma: la llista es pot muntar des del menú
  // contextual o des del diàleg, i dos ids iguals al DOM deixarien la llista
  // sense nom accessible fiable
  const subheaderId = `pictogram-actions-${pictogram.indexSequence}`;
  const pasteNameId = `${subheaderId}-paste`;
  const pasteHelpId = `${subheaderId}-paste-help`;

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
        .map((group) =>
          group.filter(
            ({ key }) =>
              !omit.includes(key) &&
              (key !== "resetStyle" || customized) &&
              (key !== "editText" || editTextAction !== undefined),
          ),
        )
        // Un grup que es queda buit per `omit` no ha de deixar cap separador
        .filter((group) => group.length > 0)
        .map((group, groupIndex) => (
          <React.Fragment key={group[0].key}>
            {groupIndex > 0 && <Divider component="li" />}
            {group.map(({ key, icon, message, destructive }) => {
              const paste = key === "paste";
              // `aria-disabled` i no `disabled`: desactivada, MUI atenua la
              // fila sencera i el text que explica per què es quedaria a
              // 2,5:1; i la fila sortiria de l'ordre del teclat sense avís
              const unavailable = paste && pasteEmpty;
              const tone = destructive
                ? { color: "error.main" }
                : unavailable
                  ? { color: "text.disabled" }
                  : undefined;
              return (
                <ListItemButton
                  key={key}
                  aria-disabled={unavailable || undefined}
                  // El nom és l'acció; el que hi ha copiat (o per què no es pot)
                  // n'és la descripció, i no s'hi barreja
                  aria-labelledby={paste ? pasteNameId : undefined}
                  aria-describedby={paste ? pasteHelpId : undefined}
                  onClick={() => handlerSelect(key)}
                  sx={tone}
                >
                  <ListItemIcon sx={tone}>{icon}</ListItemIcon>
                  <ListItemText
                    primary={intl.formatMessage(messages[message])}
                    secondary={paste ? pasteHelp : undefined}
                    slotProps={{
                      primary: paste ? { id: pasteNameId } : undefined,
                      secondary: paste ? { id: pasteHelpId } : undefined,
                    }}
                  />
                  {paste && pasteImage && (
                    // Miniatura del que hi ha copiat: sobre paper blanc, com la
                    // targeta, perquè el traç negre es vegi també en tema fosc
                    <Box
                      component="img"
                      src={pasteImage}
                      alt=""
                      // Sense xarxa no s'ensenya la icona de trencat: el text de
                      // sota ja diu què hi ha copiat
                      onError={(
                        event: React.SyntheticEvent<HTMLImageElement>,
                      ) => {
                        event.currentTarget.hidden = true;
                      }}
                      sx={{
                        width: 40,
                        height: 40,
                        marginInlineStart: 1,
                        padding: 0.25,
                        borderRadius: 1,
                        objectFit: "contain",
                        backgroundColor: sheetSurface,
                      }}
                    />
                  )}
                </ListItemButton>
              );
            })}
          </React.Fragment>
        ))}
    </List>
  );
};

export default MouseActionList;
