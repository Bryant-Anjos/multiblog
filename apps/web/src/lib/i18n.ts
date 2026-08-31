export type Lang = "en" | "pt-BR";

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "pt-BR", label: "Português (Brasil)" },
];

export function normalizeLang(lang?: string | null): Lang {
  if (!lang) return "en";
  const l = lang.toLowerCase();
  if (l === "pt-br" || l === "pt" || l === "pt_br") return "pt-BR";
  return "en";
}

const dict = {
  en: {
    // Sidebar / navigation chrome
    home: "Home",
    blog: "Blog",
    content: "Content",
    search: "Search",
    searching: "Searching...",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    // Homepage sections
    featured: "Featured",
    recentPosts: "Recent Posts",
    stories: "Stories",
    pages: "Pages",
    readArticle: "Read article",
    viewAll: "View all",
    minRead: "min read",
    diary: "Diary",
    // Listing pages
    blogPosts: "Blog Posts",
    noPosts: "No posts published yet.",
    noStories: "No stories published yet.",
    mainStory: "Main story",
    related: "Related",
    relatedStory: "Related Story",
    spinoffs: "Spin-offs & Related",
    chapters: "Chapters",
    chapter: "Chapter",
    story: "Story",
    noPages: "No pages published yet.",
    // Reading settings
    readingSettings: "Reading settings",
    fontSize: "Font size",
    readingWidth: "Reading width",
    small: "Small",
    medium: "Medium",
    large: "Large",
    normal: "Normal",
    wide: "Wide",
    // Post/reading meta
    readingTime: "min read",
    // Misc / empty states
    empty: "No results",
    openNavigation: "Open navigation",
    toggleTheme: "Toggle theme",
    previous: "Previous",
    next: "Next",
    backToStory: "Back to Story",
    previousChapter: "Previous Chapter",
    nextChapter: "Next Chapter",
    back: "Back",
    chapterNumber: "Chapter",
  },
  "pt-BR": {
    home: "Início",
    blog: "Blog",
    content: "Conteúdo",
    search: "Pesquisar",
    searching: "Pesquisando...",
    theme: "Tema",
    light: "Claro",
    dark: "Escuro",
    featured: "Em destaque",
    recentPosts: "Publicações recentes",
    stories: "Histórias",
    pages: "Páginas",
    readArticle: "Ler artigo",
    viewAll: "Ver todos",
    minRead: "min de leitura",
    diary: "Diário",
    blogPosts: "Publicações do Blog",
    noPosts: "Nenhuma publicação ainda.",
    noStories: "Nenhuma história publicada ainda.",
    mainStory: "História principal",
    related: "Relacionada",
    relatedStory: "História relacionada",
    spinoffs: "Derivadas e relacionadas",
    chapters: "Capítulos",
    chapter: "Capítulo",
    story: "História",
    noPages: "Nenhuma página publicada ainda.",
    readingSettings: "Configurações de leitura",
    fontSize: "Tamanho da fonte",
    readingWidth: "Largura de leitura",
    small: "Pequeno",
    medium: "Médio",
    large: "Grande",
    normal: "Normal",
    wide: "Ampla",
    readingTime: "min de leitura",
    empty: "Nenhum resultado",
    openNavigation: "Abrir navegação",
    toggleTheme: "Alternar tema",
    previous: "Anterior",
    next: "Próximo",
    backToStory: "Voltar à história",
    previousChapter: "Capítulo anterior",
    nextChapter: "Próximo capítulo",
    back: "Voltar",
    chapterNumber: "Capítulo",
  },
} as const;

export type TranslationKey = keyof (typeof dict)["en"];

export function translate(lang: Lang | undefined, key: TranslationKey): string {
  const l = normalizeLang(lang);
  return dict[l][key];
}

export function getDocumentLang(lang?: string): string {
  return normalizeLang(lang);
}
