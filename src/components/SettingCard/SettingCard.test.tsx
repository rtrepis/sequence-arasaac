import { render, fireEvent, screen } from "../../utils/test-utils";
import SettingCard from "./SettingCard";
import { settingsPictApiAra } from "./SettingCard.lang";

describe("Give a component Setting Item", () => {
  describe("When rendered whit 'skins' array", () => {
    test("Then should show button and image all skins subtract uiSettingDefaultType", () => {
      const pathExpect = "/img/settings/skin/";
      const skins = ["Asian", "Aztec", "Black", "Mulatto", "White"];
      const mockAction = jest.fn();
      const uiSettingDefaultType = "White";

      render(
        <SettingCard
          setting={settingsPictApiAra.skin}
          action={mockAction}
          selected={"aztec"}
        />
      );

      skins
        .filter((skin) => skin !== uiSettingDefaultType)
        .forEach((skin) => {
          const buttonsSkin = screen.getByRole("button", { name: skin });
          const imageSkin = screen.getByRole("img", { name: skin });
          const pathImage = imageSkin.getAttribute("src");

          fireEvent.click(buttonsSkin);

          expect(buttonsSkin).toBeInTheDocument();
          expect(pathImage).toBe(
            `${pathExpect + skin.toLocaleLowerCase()}.png`
          );
          expect(mockAction).toBeCalledWith({
            setting: "skin",
            value: skin.toLocaleLowerCase(),
          });
        });
    });
  });

  describe("When rendered", () => {
    test("Then should show 'apply all' and 'default' buttons", () => {
      const expectButtons = ["Apply All", "Default"];
      const mockAction = jest.fn();

      render(
        <SettingCard
          setting={settingsPictApiAra.skin}
          action={mockAction}
          selected={"aztec"}
        />
      );

      expectButtons.forEach((expectButton) => {
        const button = screen.getByRole("button", { name: expectButton });

        fireEvent.click(button);

        expect(button).toBeInTheDocument();
      });
    });
  });
});
