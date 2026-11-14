import React from "react";
import {
  MdOutlineDashboard,
  MdTableRows,
  MdViewColumn,
  MdViewStream,
} from "react-icons/md";
import StyledToggleButtonGroup from "@/style/StyledToggleButtonGroup";
import type { PageDisposition } from "@/types/ui";
import { IconToggleButton } from "@/components/SettingsLayout";
import messages from "@features/free-layout/components/ViewLevels/ViewLevels.lang";

interface DispositionToggleProps {
  value: PageDisposition;
  onChange: (disposition: PageDisposition) => void;
  /** L'`id` del títol de la fila, que en dona el nom */
  labelId: string;
  /** L'`id` de l'ajuda de sota la fila */
  helperId?: string;
}

/**
 * La tria de la disposició d'una pàgina: simple, columnes, files o lliure. La
 * mateixa al nivell «Pàgina» de la columna de la vista i al panell «Pàgina i
 * distribució» de la configuració. En dues files de dos (pas 7c): Simple i
 * Lliure a dalt, Files i Columnes a sota. Quatre en línia, al costat del títol
 * i l'etiqueta «Nou», no hi cabien a la columna.
 */
const DispositionToggle = ({
  value,
  onChange,
  labelId,
  helperId,
}: DispositionToggleProps): React.ReactElement => (
  <StyledToggleButtonGroup
    value={value}
    exclusive
    onChange={(_, next: PageDisposition | null) => next && onChange(next)}
    aria-labelledby={labelId}
    aria-describedby={helperId}
    sx={{ display: "grid", gridTemplateColumns: "repeat(2, auto)" }}
  >
    <IconToggleButton value="auto" message={messages.modeAuto}>
      <MdViewStream />
    </IconToggleButton>
    <IconToggleButton value="free" message={messages.byFree}>
      <MdOutlineDashboard />
    </IconToggleButton>
    <IconToggleButton value="rows" message={messages.byRows}>
      <MdTableRows />
    </IconToggleButton>
    <IconToggleButton value="columns" message={messages.byColumns}>
      <MdViewColumn />
    </IconToggleButton>
  </StyledToggleButtonGroup>
);

export default DispositionToggle;
