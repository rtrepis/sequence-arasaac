import { render, screen } from "@testing-library/react";
import { BorderPictI, PictogramI } from "../../types/sequence";
import PictogramCard from "./PictogramCard";

let pictogramEmpty: PictogramI = {
  index: 1,
  number: 26527,
  border: {
    in: { color: "blue", radius: 20, size: 2 },
    out: { color: "green", radius: 20, size: 2 },
  },
};

describe("Give a PictogramShow component", () => {
  describe("When it's rendered with view 'complete' and index '1'", () => {
    test("Then should show a pictogram, index, text pictogram", () => {
      const expectPictogram = {
        index: "1",
        number: 2222,
        altImage: "Pictogram",
        textPictogram: "Pictogram Word",
      };

      render(<PictogramCard view={"complete"} pictogram={pictogramEmpty} />);
      const pictogramShow = {
        header: screen.getByRole("heading", { name: expectPictogram.index }),
        image: screen.getByRole("img", { name: expectPictogram.altImage }),
        footer: screen.getByRole("heading", {
          name: expectPictogram.textPictogram,
        }),
      };

      Object.values(pictogramShow).forEach((expectIn) =>
        expect(expectIn).toBeInTheDocument()
      );
    });
  });

  describe("When it's rendered with view 'header' and index '1'", () => {
    test("Then should show a pictogram and index", () => {
      const expectPictogram = {
        index: "1",
        number: 2222,
        altImage: "Pictogram",
      };

      render(<PictogramCard view={"header"} pictogram={pictogramEmpty} />);
      const pictogramShow = {
        header: screen.getByRole("heading", { name: expectPictogram.index }),
        image: screen.getByRole("img", { name: expectPictogram.altImage }),
      };

      Object.values(pictogramShow).forEach((expectIn) => {
        expect(expectIn).toBeInTheDocument();
      });
    });
  });

  describe("When it's rendered with view 'footer' and index '1'", () => {
    test("Then should show a pictogram and text pictogram", () => {
      const expectPictogram = {
        number: 2222,
        altImage: "Pictogram",
        textPictogram: "Pictogram Word",
      };

      render(<PictogramCard view={"complete"} pictogram={pictogramEmpty} />);
      const pictogramShow = {
        image: screen.getByRole("img", { name: expectPictogram.altImage }),
        footer: screen.getByRole("heading", {
          name: expectPictogram.textPictogram,
        }),
      };

      Object.values(pictogramShow).forEach((expectIn) =>
        expect(expectIn).toBeInTheDocument()
      );
    });
  });

  describe("When it's rendered with view 'none' and index '1'", () => {
    test("Then should show a pictogram", () => {
      const expectPictogram = {
        number: 2222,
        altImage: "Pictogram",
      };

      render(<PictogramCard view={"complete"} pictogram={pictogramEmpty} />);
      const pictogramShow = {
        image: screen.getByRole("img", { name: expectPictogram.altImage }),
      };

      Object.values(pictogramShow).forEach((expectIn) =>
        expect(expectIn).toBeInTheDocument()
      );
    });
  });

  describe("When it's rendered with borders props", () => {
    test("Then should show a pictogram with this borders", () => {
      const pictogram = {
        card: "card-pictogram",
        altImage: "Pictogram",
      };
      const expectBorder: BorderPictI = {
        color: "blue",
        size: 2,
        radius: 20,
      };

      render(<PictogramCard view={"complete"} pictogram={pictogramEmpty} />);
      const pictogramShowBorder = {
        card: screen.getByTestId(pictogram.card),
        image: screen.getByRole("img", {
          name: pictogram.altImage,
        }),
      };
      const pictogramCSS = {
        card: window.getComputedStyle(pictogramShowBorder.card),
        image: window.getComputedStyle(pictogramShowBorder.image),
      };

      Object.values(pictogramCSS).forEach((expectProperty) => {
        expect(expectProperty).toHaveProperty(
          "border",
          `${expectBorder.size}px solid`
        );
        expect(expectProperty).toHaveProperty(
          "border-radius",
          `${expectBorder.radius}px`
        );
      });
    });
  });

  describe("When it's rendered with variant 'plane'", () => {
    test("Then should show a pictogram without shadow", () => {
      const pictogram = {
        card: "card-pictogram",
      };
      const variant = "plane";
      const expectStyle = "0px 0px 0px 0px #fff";

      render(
        <PictogramCard
          view={"complete"}
          variant={variant}
          pictogram={pictogramEmpty}
        />
      );
      const pictogramShowBorder = {
        card: screen.getByTestId(pictogram.card),
      };
      const pictogramCSS = {
        card: window.getComputedStyle(pictogramShowBorder.card),
      };

      expect(pictogramCSS.card).toHaveProperty("box-shadow", expectStyle);
    });
  });

  describe("When it's rendered with skin corner case 'asian'", () => {
    test("Then should image path change to 'assian'", () => {
      pictogramEmpty = { ...pictogramEmpty, skin: "asian" };
      const expectedPath =
        "https://api.arasaac.org/api/pictograms/26527?skin=assian";

      render(<PictogramCard pictogram={pictogramEmpty} view={"none"} />);
      const image = screen.getByRole("img", { name: "Pictogram" });
      const pathImage = image.getAttribute("src");

      expect(pathImage).toStrictEqual(expectedPath);
    });
  });
});
