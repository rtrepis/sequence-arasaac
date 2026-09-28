// «Desa com a estil per defecte»: l'estil passa a ser el que reben les
// documents nous, i es desa com les altres preferències (al compte si hi ha
// sessió, al navegador si no n'hi ha), amb reintent i diàleg d'error.
import { useCallback } from "react";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { SequenceStyle } from "@/types/document";
import {
  updateDefaultSettingsActionCreator,
  viewSettingsActionCreator,
} from "@features/user-settings/store/uiSlice";
import { useSaveUiSettings } from "@features/backend/user-settings/hooks/useSaveUiSettings";
import { pictStyleOf } from "@features/sequence/style/styleModel";
import messages from "@features/sequence/components/DocumentStyle/DocumentStyle.lang";

export const useSetDefaultStyle = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const viewSettings = useAppSelector((state) => state.ui.viewSettings);
  const { saveInBackground, retry, failure, isRetrying, dismissError } =
    useSaveUiSettings();

  const setAsDefault = useCallback(
    (style: SequenceStyle) => {
      dispatch(updateDefaultSettingsActionCreator(pictStyleOf(style)));
      // Només els camps d'estil: la pàgina, la direcció i l'autor són
      // preferències de disposició i no venen amb cap estil
      dispatch(viewSettingsActionCreator({ ...viewSettings, ...style.view }));
      saveInBackground({
        successMessage: intl.formatMessage(messages.setAsDefaultSuccess),
      });
    },
    [dispatch, intl, saveInBackground, viewSettings],
  );

  return { setAsDefault, retry, failure, isRetrying, dismissError };
};
