// #Tecnologia #JoaoVictor
const translatedPaths = new Set(["/", "/cv", "/business", "/contact"]);

export function getPageLocale(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const isEnglish = path === "/en" || path.startsWith("/en/");
  const basePath = isEnglish ? path.slice(3) || "/" : path;
  const hasTranslation = translatedPaths.has(basePath);

  return {
    isEnglish,
    language: isEnglish ? "en-US" : "pt-BR",
    openGraphLocale: isEnglish ? "en_US" : "pt_BR",
    home: isEnglish ? "/en" : "/",
    hasTranslation,
    ptPath: hasTranslation ? basePath : "/",
    enPath: hasTranslation && basePath !== "/" ? `/en${basePath}` : "/en",
  };
}
