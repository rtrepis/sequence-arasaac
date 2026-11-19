import { describe, expect, it } from "vitest";
import { renderWithProviders, screen } from "@/test/renderWithProviders";
import { NewsItem } from "../../data/newsItems";
import SupersededNotice from "./SupersededNotice";

const item = (superseded?: NewsItem["superseded"]): NewsItem => ({
  slug: "old-news",
  titleId: "news.old-news.title",
  summaryId: "news.old-news.summary",
  contentId: "news.old-news.content",
  coverImage: "",
  images: [],
  date: "2026-02-15",
  category: "nova",
  superseded,
});

describe("SupersededNotice", () => {
  it("sense la marca no pinta res", () => {
    const { container } = renderWithProviders(
      <SupersededNotice item={item()} locale="en" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("amb la marca, diu de quan és la notícia", () => {
    renderWithProviders(<SupersededNotice item={item({})} locale="en" />);
    expect(screen.getByRole("note")).toHaveTextContent(
      "This news item was published on February 15, 2026",
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("enllaça a la notícia que la substitueix, en l'idioma de la pàgina", () => {
    renderWithProviders(
      <SupersededNotice
        item={item({ replacedBy: "autosave-draft" })}
        locale="en"
      />,
    );
    const link = screen.getByRole("link", {
      name: "Your work is no longer lost",
    });
    expect(link).toHaveAttribute("href", "/en/news/autosave-draft");
    expect(screen.getByRole("note")).toHaveTextContent("How it works now:");
  });

  it("si la notícia que la substitueix no existeix, no hi posa cap enllaç", () => {
    renderWithProviders(
      <SupersededNotice item={item({ replacedBy: "missing" })} locale="en" />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
