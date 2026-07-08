import { useMemo } from "react";
import { useAppSelector } from "@/app/hooks";

// Retorna les paraules del vocabulari personal fusionades amb les keywords generals.
// Les paraules personals sempre apareixen primer per prioritzar-les a l'autocomplete.
const usePersonalKeywords = (): string[] => {
  const keywords = useAppSelector((state) => state.ui.lang.keywords);
  const wordProfiles = useAppSelector((state) => state.ui.wordProfiles);

  return useMemo(() => {
    const personalWords = wordProfiles.map((p) => p.word);
    const keywordsSet = new Set(keywords.map((k) => k.toLowerCase()));
    const uniquePersonal = personalWords.filter(
      (w) => !keywordsSet.has(w.toLowerCase()),
    );
    return [...uniquePersonal, ...keywords];
  }, [keywords, wordProfiles]);
};

export default usePersonalKeywords;
