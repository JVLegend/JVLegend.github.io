// #JoaoVictor #SEO #Tecnologia
import { readFileSync } from "node:fs";
import type { AstroIntegration } from "astro";
import sitemap from "@astrojs/sitemap";

export default function indexableSitemap(): AstroIntegration {
  let outputDirectory: URL;
  let base = "/";
  let format = "directory";

  const integration = sitemap({
    filter(page) {
      const pathname = decodeURIComponent(new URL(page).pathname)
        .slice(base.length)
        .replace(/\/+$/, "");
      const filename = pathname
        ? format === "file"
          ? `${pathname}.html`
          : `${pathname}/index.html`
        : "index.html";
      const html = readFileSync(new URL(filename, outputDirectory), "utf8");

      // Read the generated HTML so future pages and blog posts follow their own robots metadata.
      return ![...html.matchAll(/<meta\b[^>]*>/gi)].some(([tag]) => {
        const attributes = new Map(
          [
            ...tag.matchAll(
              /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g,
            ),
          ].map(([, name, doubleQuoted, singleQuoted, unquoted]) => [
            name.toLowerCase(),
            doubleQuoted ?? singleQuoted ?? unquoted,
          ]),
        );
        return (
          /^(robots|googlebot)$/i.test(attributes.get("name") ?? "") &&
          /(?:^|[\s,])(noindex|none)(?:$|[\s,])/i.test(
            attributes.get("content") ?? "",
          )
        );
      });
    },
  });

  return {
    ...integration,
    hooks: {
      ...integration.hooks,
      "astro:config:done": async (options) => {
        base = options.config.base.replace(/\/?$/, "/");
        format = options.config.build.format;
        await integration.hooks["astro:config:done"]?.(options);
      },
      "astro:build:done": async (options) => {
        outputDirectory = options.dir;
        await integration.hooks["astro:build:done"]?.(options);
      },
    },
  };
}
