import { render, fireEvent, screen } from "../../../utils/test-utils";
import SettingCard from "./SettingCard";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
}));

describe("Give a component Setting Item", () => {
  describe("When rendered whit 'skins' array", () => {
    test("Then should show button and image all skins subtract uiSettingDefaultType", () => {
      const pathExpect = "/img/settings/skin/";
      const skins = ["Asian", "Aztec", "Black", "Mulatto", "White"];
      const uiSettingDefaultType = "White";

      render(
        <SettingCard state="Asian" setting="skin" setState={mockDispatch} />
      );

      skins
        .filter((skin) => skin !== uiSettingDefaultType)
        .forEach((skin) => {
          const buttonsSkin = screen.getByRole("button", { name: skin });
          const imageSkin = screen.getByRole("img", { name: `Skin ${skin}` });
          const pathImage = imageSkin.getAttribute("src");

          fireEvent.click(buttonsSkin);

          expect(buttonsSkin).toBeInTheDocument();
          expect(pathImage).toBe(
            `${pathExpect + skin.toLocaleLowerCase()}.png`
          );
          expect(mockDispatch).toBeCalled();
        });
    });
  });

  describe("When rendered", () => {
    test("Then should show 'apply all' button", () => {
      const expectButtons = ["Apply All"];

      render(
        <SettingCard setting="skin" state={"aztec"} setState={mockDispatch} />
      );

      expectButtons.forEach((expectButton) => {
        const button = screen.getByRole("button", { name: expectButton });

        expect(button).toBeInTheDocument();
      });
    });
  });
});
