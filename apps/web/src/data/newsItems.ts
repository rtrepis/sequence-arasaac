// Dades de les novetats per mostrar al carousel de la pàgina principal

export type NewsCategory = "nova" | "millora" | "correccio";

export interface NewsImage {
  /**
   * Ruta de la imatge. Si porta `{locale}`, és una captura per idioma: cada
   * versió de la notícia ensenya l'app en el seu idioma (vegeu
   * `localizedNewsSrc`)
   */
  src: string;
  altId: string;
}

export interface NewsStep {
  image: NewsImage;
  /** Imatges de més del mateix pas, sota la primera */
  moreImages?: NewsImage[];
  /** Títol del pas, quan la notícia es llegeix per apartats */
  titleId?: string;
  descriptionId: string;
  video?: string;
}

/** Una pregunta freqüent i la seva resposta */
export interface NewsQuestion {
  questionId: string;
  answerId: string;
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
  /** Preguntes freqüents, al final de la notícia, amb el seu títol */
  faq?: { titleId: string; questions: NewsQuestion[] };
  /** Paràgraf de tancament, després de tot */
  closingId?: string;
}

/** La ruta d'una imatge de notícia en l'idioma de qui la llegeix */
export const localizedNewsSrc = (src: string, locale: string): string =>
  src.replace("{locale}", locale);

const DOCUMENTS = "/img/news/documents-everywhere/{locale}";
const documentsImage = (name: string, alt: string): NewsImage => ({
  src: `${DOCUMENTS}/${name}.png`,
  altId: `news.documents-everywhere.${alt}.alt`,
});
const documentsId = (key: string): string => `news.documents-everywhere.${key}`;

export const newsItems: NewsItem[] = [
  {
    slug: "documents-everywhere",
    titleId: documentsId("title"),
    summaryId: documentsId("summary"),
    contentId: documentsId("content"),
    coverImage: `${DOCUMENTS}/portada.png`,
    images: [],
    steps: [
      {
        titleId: documentsId("step1.title"),
        descriptionId: documentsId("step1.description"),
        image: documentsImage("desar", "save"),
      },
      {
        titleId: documentsId("step2.title"),
        descriptionId: documentsId("step2.description"),
        image: documentsImage("fitxer-estil", "styleFile"),
      },
      {
        titleId: documentsId("step3.title"),
        descriptionId: documentsId("step3.description"),
        image: documentsImage("franja-personalitzat", "customizedStrip"),
        moreImages: [
          documentsImage("marca-graella", "gridMark"),
          documentsImage("menu-restableix", "resetMenu"),
        ],
      },
      {
        titleId: documentsId("step4.title"),
        descriptionId: documentsId("step4.description"),
        image: documentsImage("avis-antic", "oldDocument"),
      },
      {
        titleId: documentsId("step5.title"),
        descriptionId: documentsId("step5.description"),
        image: documentsImage("estructura", "structure"),
      },
    ],
    faq: {
      titleId: documentsId("faq.title"),
      questions: [1, 2, 3, 4, 5].map((n) => ({
        questionId: documentsId(`faq.q${n}`),
        answerId: documentsId(`faq.a${n}`),
      })),
    },
    closingId: documentsId("closing"),
    date: "2026-10-01",
    category: "nova",
  },
  {
    slug: "autosave-draft",
    titleId: "news.autosave-draft.title",
    summaryId: "news.autosave-draft.summary",
    contentId: "news.autosave-draft.content",
    coverImage: "/img/news/autosave-draft.png",
    images: [],
    steps: [
      {
        image: {
          src: "/img/news/autosave-draft-step1.png",
          altId: "news.autosave-draft.step1.alt",
        },
        descriptionId: "news.autosave-draft.step1.description",
      },
      {
        image: {
          src: "/img/news/autosave-draft-step2.png",
          altId: "news.autosave-draft.step2.alt",
        },
        descriptionId: "news.autosave-draft.step2.description",
      },
    ],
    date: "2026-09-04",
    category: "millora",
  },
  {
    slug: "pictogram-actions-touch",
    titleId: "news.pictogram-actions-touch.title",
    summaryId: "news.pictogram-actions-touch.summary",
    contentId: "news.pictogram-actions-touch.content",
    coverImage: "/img/news/pictogram-actions-touch.png",
    images: [],
    steps: [
      {
        image: {
          src: "/img/news/pictogram-actions-touch-step1.png",
          altId: "news.pictogram-actions-touch.step1.alt",
        },
        descriptionId: "news.pictogram-actions-touch.step1.description",
      },
      {
        image: {
          src: "/img/news/pictogram-actions-touch-step2.png",
          altId: "news.pictogram-actions-touch.step2.alt",
        },
        descriptionId: "news.pictogram-actions-touch.step2.description",
      },
    ],
    date: "2026-09-04",
    category: "correccio",
  },
  {
    slug: "search-suggestions",
    titleId: "news.search-suggestions.title",
    summaryId: "news.search-suggestions.summary",
    contentId: "news.search-suggestions.content",
    coverImage: "/img/news/search-suggestions.png",
    images: [],
    steps: [
      {
        image: {
          src: "/img/news/search-suggestions-step1.png",
          altId: "news.search-suggestions.step1.alt",
        },
        descriptionId: "news.search-suggestions.step1.description",
      },
      {
        image: {
          src: "/img/news/search-suggestions-step2.png",
          altId: "news.search-suggestions.step2.alt",
        },
        descriptionId: "news.search-suggestions.step2.description",
      },
    ],
    date: "2026-09-04",
    category: "millora",
  },
  {
    slug: "user-preferences",
    titleId: "news.user-preferences.title",
    summaryId: "news.user-preferences.summary",
    contentId: "news.user-preferences.content",
    coverImage: "/img/news/user-preferences.png",
    images: [],
    steps: [
      {
        image: {
          src: "/img/news/user-preferences-step1.png",
          altId: "news.user-preferences.step1.alt",
        },
        descriptionId: "news.user-preferences.step1.description",
      },
      {
        image: {
          src: "/img/news/user-preferences-step2.png",
          altId: "news.user-preferences.step2.alt",
        },
        descriptionId: "news.user-preferences.step2.description",
      },
    ],
    date: "2026-09-04",
    category: "nova",
  },
  {
    slug: "pdf-quality",
    titleId: "news.pdf-quality.title",
    summaryId: "news.pdf-quality.summary",
    contentId: "news.pdf-quality.content",
    coverImage: "/img/news/pdf-quality.png",
    images: [],
    steps: [
      {
        image: {
          src: "/img/news/pdf-quality-step1.png",
          altId: "news.pdf-quality.step1.alt",
        },
        descriptionId: "news.pdf-quality.step1.description",
      },
      {
        image: {
          src: "/img/news/pdf-quality-step2.png",
          altId: "news.pdf-quality.step2.alt",
        },
        descriptionId: "news.pdf-quality.step2.description",
      },
    ],
    date: "2026-09-04",
    category: "correccio",
  },
  {
    slug: "safe-delete",
    titleId: "news.safe-delete.title",
    summaryId: "news.safe-delete.summary",
    contentId: "news.safe-delete.content",
    coverImage: "/img/news/safe-delete.png",
    images: [],
    steps: [
      {
        image: {
          src: "/img/news/safe-delete-step1.png",
          altId: "news.safe-delete.step1.alt",
        },
        descriptionId: "news.safe-delete.step1.description",
      },
      {
        image: {
          src: "/img/news/safe-delete-step2.png",
          altId: "news.safe-delete.step2.alt",
        },
        descriptionId: "news.safe-delete.step2.description",
      },
    ],
    date: "2026-09-04",
    category: "millora",
  },
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
