import toUrlPathApiAraSaac from "./toUrlPathApiAraSaac";

describe("Give a function toUrlPathApiAraSaac", () => {
  describe("When it's called with pictogram number and skin", () => {
    test("Then return path with query", () => {
      const expectPath =
        "https://api.arasaac.org/api/pictograms/233?skin=Black";
      const pictogramNumber = 233;
      const skin = "Black";

      const path = toUrlPathApiAraSaac(pictogramNumber, skin);

      expect(path).toStrictEqual(expectPath);
    });
  });
});
