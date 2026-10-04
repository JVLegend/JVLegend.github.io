// #JoaoVictor #SEO #Tecnologia
import { getPageLocale } from "./i18n";

export const normalizePagePath = (pathname: string) =>
  pathname.replace(/\/+$/, "") || "/";

export function isDemoPath(pathname: string) {
  const path = normalizePagePath(pathname);
  return (
    /^\/(homes|landing)(\/|$)/.test(path) ||
    ["/pricing", "/services"].includes(path)
  );
}

const pages: Record<
  string,
  { label: string; parent?: string; description?: string }
> = {
  "/cv": { label: "Currículo" },
  "/business": { label: "Projetos e negócios" },
  "/contact": { label: "Contato" },
  "/teses": { label: "Minhas teses" },
  "/en/cv": { label: "CV" },
  "/en/business": { label: "Projects and business" },
  "/en/contact": { label: "Contact" },
  "/en/theses": { label: "My theses" },
  "/books": { label: "Livros recomendados" },
  "/speaking": { label: "Palestras e workshops" },
  "/interesses": { label: "Áreas de interesse" },
  "/ia": {
    label: "Inteligência artificial",
    parent: "/interesses",
    description:
      "Conceitos de inteligência artificial, machine learning e AGI, aplicações e referências reunidas por João Victor Dias.",
  },
  "/longevidade": {
    label: "Longevidade",
    parent: "/interesses",
    description:
      "Panorama de temas e referências sobre envelhecimento saudável, healthspan e longevidade, uma área de interesse de João Victor Dias.",
  },
  "/progresso": {
    label: "Progresso e inovação",
    parent: "/interesses",
    description:
      "Ideias sobre progresso tecnológico, inovação e a Grande Estagnação, com referências e temas de interesse de João Victor Dias.",
  },
  "/startups": {
    label: "Startups e empreendedorismo",
    parent: "/interesses",
    description:
      "Princípios de criação de startups, cultura e empreendedorismo, com referências e leituras reunidas por João Victor Dias.",
  },
  "/privacy": {
    label: "Política de Privacidade",
    description:
      "Política de privacidade do site de João Victor Dias: tratamento de informações, cookies, contato e direitos dos visitantes.",
  },
  "/terms": {
    label: "Termos de Uso",
    description:
      "Termos de uso do site de João Victor Dias: condições de acesso, uso do conteúdo, propriedade intelectual e contato.",
  },
};

export function getPageSeo(pathname: string) {
  const path = normalizePagePath(pathname);
  const page = pages[path];
  if (!page) return undefined;
  const { isEnglish, home } = getPageLocale(path);
  const crumbs = [{ name: isEnglish ? "Home" : "Início", path: home }];
  if (page.parent)
    crumbs.push({ name: pages[page.parent].label, path: page.parent });
  crumbs.push({ name: page.label, path });
  return { ...page, crumbs };
}
