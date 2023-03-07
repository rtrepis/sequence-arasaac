import loadLocalMessages from "./loadLocaleMessages";

describe("Give a function 'loadLocalMessage", () => {
  describe("When it's called with string locale", () => {
    test("Then should return message this locale", async () => {
      const expectText = [{ type: 0, value: "Pictogrames:" }];

      const message = await loadLocalMessages("ca-ES");

      expect(message["components.pictogramAmount.label"]).toStrictEqual(
        expectText
      );
    });
  });
});
