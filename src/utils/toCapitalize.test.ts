import toCapitalize from "./toCapitalize";

describe("Give a function Capitalize", () => {
  describe("When it's called with string", () => {
    test("Then should return same string whit the first chart uppercase", () => {
      const calledText = "isPossible";
      const expectedText = "IsPossible";

      const returnText = toCapitalize(calledText);

      expect(returnText).toStrictEqual(expectedText);
    });
  });
});
