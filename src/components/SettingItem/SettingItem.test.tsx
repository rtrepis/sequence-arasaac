import { render, fireEvent, screen } from "../../utils/test-utils";
import Settings from "../../model/Settings";
import SettingItem from "./SettingItem";

describe("Give a component Setting Item", () => {
  describe("When rendered whit 'skins' array", () => {
    test("Then should show button and image all skins", () => {
      const pathExpect = "/img/settings/skin/";
      const skins = ["Asian", "Aztec", "Black", "Mulatto", "White"];
      const mockAction = jest.fn();

      render(<SettingItem item={Settings.skins} action={mockAction} />);

      skins.forEach((skin) => {
        const buttonsSkin = screen.getByRole("button", { name: skin });
        const imageSkin = screen.getByRole("img", { name: skin });
        const pathImage = imageSkin.getAttribute("src");

        fireEvent.click(buttonsSkin);

        expect(buttonsSkin).toBeInTheDocument();
        expect(pathImage).toBe(`${pathExpect + skin.toLocaleLowerCase()}.png`);
        expect(mockAction).toBeCalledWith(skin.toLocaleLowerCase());
      });
    });
  });

  describe("When rendered", () => {
    test("Then should show 'apply all' and 'default' buttons", () => {
      const expectButtons = ["Apply All", "Default"];
      const mockAction = jest.fn();

      render(<SettingItem item={Settings.skins} action={mockAction} />);

      expectButtons.forEach((expectButton) => {
        const button = screen.getByRole("button", { name: expectButton });

        fireEvent.click(button);

        expect(button).toBeInTheDocument();
      });
    });
  });
});
