// Stub: interfície que el proveïdor IA haurà d'implementar
// Implementació real pendent de triar proveïdor (OpenAI, Claude, LLM local...)
export const searchByNaturalLanguage = async (
  _text: string,
  _locale: string
): Promise<string[]> => {
  throw new Error("searchByNaturalLanguage: no implementat encara");
};
