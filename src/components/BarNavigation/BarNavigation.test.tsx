import { Typography } from "@mui/material";
import { render, screen } from "../../utils/test-utils";
import BarNavigation from "./BarNavigation";

describe("Give a component barNavigation", () => {
  describe("When rendered", () => {
    test("Then should show title app and expectButton", () => {
      const titleApp = "Sequences - AraSaac";
      const expectButton = "setting default";
      render(
        <BarNavigation>
          <Typography defaultValue={"lala"} />
        </BarNavigation>
      );
      const title = screen.getByRole("heading", { name: titleApp });
      const button = screen.getByRole("button", { name: expectButton });

      expect(title).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });
  });
});
