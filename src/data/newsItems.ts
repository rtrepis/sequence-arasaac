// Dades de les novetats per mostrar al carousel de la pàgina principal

export type NewsCategory = "nova" | "millora" | "correccio";

export interface NewsImage {
  src: string;
  altId: string;
}

export interface NewsStep {
  image: NewsImage;
  descriptionId: string;
  video?: string;
}

export interface NewsItem {
  slug: string;
  titleId: string;
  summaryId: string;
  contentId: string;
  coverImage: string;
  images: NewsImage[];
  steps?: NewsStep[];
  date: string;
  category: NewsCategory;
}

export const newsItems: NewsItem[] = [
  {
    slug: "view-improvements",
    titleId: "news.view-improvements.title",
    summaryId: "news.view-improvements.summary",
    contentId: "news.view-improvements.content",
    coverImage: "/img/news/view-improvements.png",
    images: [],
    steps: [
      {
        image: {
          src: "/img/news/view-improvements-step1.png",
          altId: "news.view-improvements.step1.alt",
        },
        descriptionId: "news.view-improvements.step1.description",
      },
      {
        image: {
          src: "/img/news/view-improvements-step2.png",
          altId: "news.view-improvements.step2.alt",
        },
        descriptionId: "news.view-improvements.step2.description",
      },
      {
        image: {
          src: "/img/news/view-improvements-step3.png",
          altId: "news.view-improvements.step3.alt",
        },
        descriptionId: "news.view-improvements.step3.description",
      },
    ],
    date: "2026-02-24",
    category: "millora",
  },
  {
    slug: "multiple-sequences",
    titleId: "news.multiple-sequences.title",
    summaryId: "news.multiple-sequences.summary",
    contentId: "news.multiple-sequences.content",
    coverImage: "/img/news/multiple-sequences.png",
    images: [
      {
        src: "/img/news/multiple-sequences-1.png",
        altId: "news.multiple-sequences.img1.alt",
      },
      {
        src: "/img/news/multiple-sequences-2.png",
        altId: "news.multiple-sequences.img2.alt",
      },
    ],
    steps: [
      {
        image: {
          src: "/img/news/multiple-sequences-step1.png",
          altId: "news.multiple-sequences.step1.alt",
        },
        descriptionId: "news.multiple-sequences.step1.description",
      },
      {
        image: {
          src: "/img/news/multiple-sequences-step2.png",
          altId: "news.multiple-sequences.step2.alt",
        },
        descriptionId: "news.multiple-sequences.step2.description",
      },
      {
        image: {
          src: "/img/news/multiple-sequences-step3.png",
          altId: "news.multiple-sequences.step3.alt",
        },
        descriptionId: "news.multiple-sequences.step3.description",
      },
      {
        image: {
          src: "/img/news/multiple-sequences-step4.png",
          altId: "news.multiple-sequences.step4.alt",
        },
        descriptionId: "news.multiple-sequences.step4.description",
      },
    ],
    date: "2025-01-15",
    category: "nova",
  },
  {
    slug: "print-preview",
    titleId: "news.print-preview.title",
    summaryId: "news.print-preview.summary",
    contentId: "news.print-preview.content",
    coverImage: "/img/news/print-preview.png",
    images: [
      {
        src: "/img/news/print-preview-1.png",
        altId: "news.print-preview.img1.alt",
      },
      {
        src: "/img/news/print-preview-2.png",
        altId: "news.print-preview.img2.alt",
      },
    ],
    date: "2025-01-15",
    category: "nova",
  },
  {
    slug: "sequence-settings",
    titleId: "news.sequence-settings.title",
    summaryId: "news.sequence-settings.summary",
    contentId: "news.sequence-settings.content",
    coverImage: "/img/news/sequence-settings.png",
    images: [
      {
        src: "/img/news/sequence-settings-1.png",
        altId: "news.sequence-settings.img1.alt",
      },
      {
        src: "/img/news/sequence-settings-2.png",
        altId: "news.sequence-settings.img2.alt",
      },
    ],
    date: "2025-01-15",
    category: "millora",
  },
  {
    slug: "save-load",
    titleId: "news.save-load.title",
    summaryId: "news.save-load.summary",
    contentId: "news.save-load.content",
    coverImage: "/img/news/save-load.png",
    images: [
      {
        src: "/img/news/save-load-1.png",
        altId: "news.save-load.img1.alt",
      },
      {
        src: "/img/news/save-load-2.png",
        altId: "news.save-load.img2.alt",
      },
    ],
    date: "2025-01-15",
    category: "nova",
  },
];
