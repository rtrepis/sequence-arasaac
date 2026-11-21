import { describe, expect, it } from "vitest";
import { carouselNews, NewsItem, newsItems } from "./newsItems";

// Les notícies que la fase 1 de `docs/plans/PLA-noticies.md` va trobar superades
const SUPERSEDED = [
  "multiple-sequences",
  "view-improvements",
  "logo-menu",
  "number-font",
  "new-languages",
  "user-preferences",
];

const item = (slug: string, superseded?: NewsItem["superseded"]): NewsItem => ({
  slug,
  titleId: `news.${slug}.title`,
  summaryId: `news.${slug}.summary`,
  contentId: `news.${slug}.content`,
  coverImage: "",
  images: [],
  date: "2026-01-01",
  category: "nova",
  superseded,
});

describe("notícies superades", () => {
  it("el carrusel no porta les superades, i manté l'ordre de la resta", () => {
    const items = [item("a"), item("b", {}), item("c")];
    expect(carouselNews(items).map((news) => news.slug)).toEqual(["a", "c"]);
  });

  it("les superades de l'auditoria porten la marca, i cap altra", () => {
    const marked = newsItems
      .filter((news) => news.superseded)
      .map((news) => news.slug);
    expect(marked.sort()).toEqual([...SUPERSEDED].sort());
  });

  it("el carrusel de l'app no en porta cap de superada", () => {
    const slugs = carouselNews().map((news) => news.slug);
    for (const slug of SUPERSEDED) expect(slugs).not.toContain(slug);
  });

  it("la notícia que en substitueix una existeix i no és superada", () => {
    for (const news of newsItems) {
      const replacedBy = news.superseded?.replacedBy;
      if (!replacedBy) continue;
      const replacement = newsItems.find((other) => other.slug === replacedBy);
      expect(replacement, `${news.slug} → ${replacedBy}`).toBeDefined();
      expect(replacement?.superseded).toBeUndefined();
    }
  });
});
