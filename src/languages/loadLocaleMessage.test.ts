import loadLocalMessages from "./loadLocaleMessages";

describe("Give a function 'loadLocalMessage", () => {
  describe("When it's called with string locale 'en'", () => {
    test("Then should return expect message 'Pictograms:'", async () => {
      const locale = "en";
      const expectText = [{ type: 0, value: "Pictograms:" }];

      const message = await loadLocalMessages(locale);

      expect(message["components.pictogramAmount.label"]).toStrictEqual(
        expectText
      );
    });
  });

  describe("When it's called with string locale 'ca-ES'", () => {
    test("Then should return expect message 'Pictogrames:'", async () => {
      const locale = "ca-ES";
      const expectText = [{ type: 0, value: "Pictogrames:" }];

      const message = await loadLocalMessages(locale);

      expect(message["components.pictogramAmount.label"]).toStrictEqual(
        expectText
      );
    });
  });
});
