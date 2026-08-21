// Punt de muntatge de l'autodesat de l'esborrany. No pinta res: existeix
// perquè el hook necessita ser dins de l'IntlProvider i del FeedbackProvider,
// i el lloc on tots dos hi són és el layout, no index.tsx.
import { ReactElement } from "react";
import { useDocumentDraft } from "../hooks/useDocumentDraft";

const DocumentDraftSync = (): ReactElement | null => {
  useDocumentDraft();

  return null;
};

export default DocumentDraftSync;
