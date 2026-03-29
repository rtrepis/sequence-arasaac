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
    slug: "download-pdf",
    titleId: "news.download-pdf.title",
    summaryId: "news.download-pdf.summary",
    contentId: "news.download-pdf.content",
    coverImage: "/img/news/download-pdf.png",
    images: [],
    steps: [
      {
        image: {
          src: "/img/news/download-pdf-step1.png",
          altId: "news.download-pdf.step1.alt",
        },
        descriptionId: "news.download-pdf.step1.description",
      },
      {
        image: {
          src: "/img/news/download-pdf-step2.png",
          altId: "news.download-pdf.step2.alt",
        },
        descriptionId: "news.download-pdf.step2.description",
      },
    ],
    date: "2026-03-13",
    category: "millora",
  },
  {
    slug: "new-languages",
    titleId: "news.new-languages.title",
    summaryId: "news.new-languages.summary",
    contentId: "news.new-languages.content",
    coverImage: "/img/news/new-languages.png",
    images: [],
    steps: [
      {
        image: {
          src: "/img/news/new-languages-step1.png",
          altId: "news.new-languages.step1.alt",
        },
        descriptionId: "news.new-languages.step1.description",
      },
      {
        image: {
          src: "/img/news/new-languages-step2.png",
          altId: "news.new-languages.step2.alt",
        },
        descriptionId: "news.new-languages.step2.description",
      },
      {
        image: {
          src: "/img/news/new-languages-step3.png",
          altId: "news.new-languages.step3.alt",
        },
        descriptionId: "news.new-languages.step3.description",
      },
    ],
    date: "2026-03-13",
    category: "nova",
  },
  {
    slug: "save-improvements",
    titleId: "news.save-improvements.title",
    summaryId: "news.save-improvements.summary",
    contentId: "news.save-improvements.content",
    coverImage: "/img/news/save-improvements.png",
    images: [],
    steps: [
      {
        image: {
          src: "/img/news/save-improvements-step1.png",
          altId: "news.save-improvements.step1.alt",
        },
        descriptionId: "news.save-improvements.step1.description",
      },
      {
        image: {
          src: "/img/news/save-improvements-step2.png",
          altId: "news.save-improvements.step2.alt",
        },
        descriptionId: "news.save-improvements.step2.description",
      },
      {
        image: {
          src: "/img/news/save-improvements-step3.png",
          altId: "news.save-improvements.step3.alt",
        },
        descriptionId: "news.save-improvements.step3.description",
      },
    ],
    date: "2026-02-28",
    category: "millora",
  },
  {
    slug: "number-font",
    titleId: "news.number-font.title",
    summaryId: "news.number-font.summary",
    contentId: "news.number-font.content",
    coverImage: "/img/news/number-font.png",
    images: [],
    steps: [
      {
        image: {
          src: "/img/news/number-font-step1.png",
          altId: "news.number-font.step1.alt",
        },
        descriptionId: "news.number-font.step1.description",
      },
      {
        image: {
          src: "/img/news/number-font-step2.png",
          altId: "news.number-font.step2.alt",
        },
        descriptionId: "news.number-font.step2.description",
      },
      {
        image: {
          src: "/img/news/number-font-step3.png",
          altId: "news.number-font.step3.alt",
        },
        descriptionId: "news.number-font.step3.description",
      },
    ],
    date: "2026-02-27",
    category: "millora",
  },
  {
    slug: "logo-menu",
    titleId: "news.logo-menu.title",
    summaryId: "news.logo-menu.summary",
    contentId: "news.logo-menu.content",
    coverImage: "/img/news/logo-menu.png",
    images: [],
    steps: [
      {
        image: {
          src: "/img/news/logo-menu-step1.png",
          altId: "news.logo-menu.step1.alt",
        },
        descriptionId: "news.logo-menu.step1.description",
      },
      {
        image: {
          src: "/img/news/logo-menu-step2.png",
          altId: "news.logo-menu.step2.alt",
        },
        descriptionId: "news.logo-menu.step2.description",
      },
      {
        image: {
          src: "/img/news/logo-menu-step3.png",
          altId: "news.logo-menu.step3.alt",
        },
        descriptionId: "news.logo-menu.step3.description",
      },
    ],
    date: "2026-02-24",
    category: "nova",
  },
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
    date: "2026-02-15",
    category: "nova",
  },
];
