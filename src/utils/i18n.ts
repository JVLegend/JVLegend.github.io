// #Tecnologia #JoaoVictor
const translatedPaths = new Map([
  ["/", "/en"],
  ["/cv", "/en/cv"],
  ["/business", "/en/business"],
  ["/contact", "/en/contact"],
  ["/teses", "/en/theses"],
  ["/speaking", "/en/speaking"],
]);

export function getPageLocale(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const isEnglish = path === "/en" || path.startsWith("/en/");
  const basePath = isEnglish
    ? Array.from(translatedPaths).find(
        ([, english]) => english === path,
      )?.[0] ||
      path.slice(3) ||
      "/"
    : path;
  const hasTranslation = translatedPaths.has(basePath);

  return {
    isEnglish,
    language: isEnglish ? "en-US" : "pt-BR",
    openGraphLocale: isEnglish ? "en_US" : "pt_BR",
    home: isEnglish ? "/en" : "/",
    hasTranslation,
    ptPath: hasTranslation ? basePath : "/",
    enPath: translatedPaths.get(basePath) || "/en",
  };
}
