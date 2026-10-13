// #JoaoVictor #SEO #Tecnologia
import { getPageLocale } from "./i18n";

export const normalizePagePath = (pathname: string) =>
  pathname.replace(/\/+$/, "") || "/";

export function isDemoPath(pathname: string) {
  const path = normalizePagePath(pathname);
  return /^\/(homes|landing)(\/|$)/.test(path) || ["/pricing"].includes(path);
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
  "/speaking": { label: "Palestras e workshops" },
  "/en/speaking": { label: "Talks and workshops" },
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
