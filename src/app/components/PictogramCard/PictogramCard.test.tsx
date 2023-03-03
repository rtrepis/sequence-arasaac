import { render, screen } from "@testing-library/react";
import { BorderPictI } from "../../types/sequence";
import PictogramCard from "./PictogramCard";

describe("Give a PictogramShow component", () => {
  describe("When it's rendered with view 'complete' and index '1'", () => {
    test("Then should show a pictogram, index, text pictogram", () => {
      const expectPictogram = {
        index: "1",
        altImage: "Pictogram",
        textPictogram: "Pictogram Word",
      };

      render(<PictogramCard index={1} view={"complete"} />);
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
        altImage: "Pictogram",
      };

      render(<PictogramCard index={1} view={"header"} />);
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
        altImage: "Pictogram",
        textPictogram: "Pictogram Word",
      };

      render(<PictogramCard index={1} view={"complete"} />);
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
        altImage: "Pictogram",
      };

      render(<PictogramCard index={1} view={"complete"} />);
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
        size: 5,
        radius: 5,
      };

      render(
        <PictogramCard
          index={1}
          view={"complete"}
          borderIn={expectBorder}
          borderOut={expectBorder}
        />
      );
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

      render(<PictogramCard index={1} view={"complete"} variant={variant} />);
      const pictogramShowBorder = {
        card: screen.getByTestId(pictogram.card),
      };
      const pictogramCSS = {
        card: window.getComputedStyle(pictogramShowBorder.card),
      };

      expect(pictogramCSS.card).toHaveProperty("box-shadow", expectStyle);
    });
  });
});
