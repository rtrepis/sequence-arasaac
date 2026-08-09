import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { updateKeywordsActionCreator } from "@features/user-settings/store/uiSlice";
import { fetchKeywordsForLocale } from "../api/arasaacClient";

// Manté les keywords d'ARASAAC sincronitzades amb l'idioma de cerca.
// És reactiu: si l'idioma canvia (bootstrap de settings, sessió del backend o
// configuració manual), es tornen a carregar. La cancel·lació evita que una
// resposta antiga (ex. la de l'idioma per defecte durant el bootstrap)
// sobreescrigui la de l'idioma correcte.
const useArasaacKeywords = () => {
  const searchLang = useAppSelector((state) => state.ui.lang.search);
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;

    const loadKeywords = async () => {
      try {
        const words = await fetchKeywordsForLocale(searchLang);
        if (!cancelled) dispatch(updateKeywordsActionCreator(words));
      } catch {
        console.info("failed fetch keywords");
      }
    };

    loadKeywords();
    return () => {
      cancelled = true;
    };
  }, [searchLang, dispatch]);
};

export default useArasaacKeywords;
