import {
  currentWord,
  filterByCurrentWord,
  parseSearchPhrase,
  stringToWords,
} from "./magicSearchUtils";

describe("magicSearchUtils", () => {
  describe("currentWord", () => {
    it("hauria de retornar la paraula després de l'última coma", () => {
      expect(currentWord("nen, posar, cin")).toBe("cin");
    });

    it("hauria de retornar tota la frase si no hi ha comes", () => {
      expect(currentWord("nen")).toBe("nen");
    });

    it("hauria de retornar cadena buida just després d'una coma", () => {
      expect(currentWord("nen, ")).toBe("");
    });
  });

  describe("stringToWords", () => {
    it("hauria de separar per comes i netejar espais", () => {
      expect(stringToWords("nen, posar , cinturó")).toEqual([
        "nen",
        "posar",
        "cinturó",
      ]);
    });

    it("hauria de descartar entrades buides", () => {
      expect(stringToWords("nen,, ,posar")).toEqual(["nen", "posar"]);
    });

    it("hauria de retornar llista buida per una frase buida", () => {
      expect(stringToWords("")).toEqual([]);
    });
  });

  describe("parseSearchPhrase", () => {
    it("hauria de detectar una resposta d'IA amb la clau ia", () => {
      const phrase = '{"ia":[{"word":"nen","text":"el nen"}]}';
      const result = parseSearchPhrase(phrase);
      expect(result.isAi).toBe(true);
      expect(result.words).toEqual([{ word: "nen", text: "el nen" }]);
    });

    it("hauria de tractar text normal com a entrada manual", () => {
      const result = parseSearchPhrase("nen, posar");
      expect(result.isAi).toBe(false);
      expect(result.words).toEqual(["nen", "posar"]);
    });

    it("hauria de tractar JSON sense clau ia com a entrada manual", () => {
      const result = parseSearchPhrase('{"altra":"cosa"}');
      expect(result.isAi).toBe(false);
    });
  });

  describe("filterByCurrentWord", () => {
    const options = ["casa", "cases", "castell", "gos"];

    it("hauria de filtrar per la paraula actual ignorant el prefix", () => {
      const result = filterByCurrentWord(options, {
        inputValue: "gos, cas",
      });
      expect(result).toEqual(["casa", "cases", "castell"]);
    });

    it("no hauria de suggerir res amb menys de 3 lletres", () => {
      const result = filterByCurrentWord(options, { inputValue: "gos, ca" });
      expect(result).toEqual([]);
    });
  });
});
