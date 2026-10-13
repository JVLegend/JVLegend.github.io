import fs from "node:fs/promises";
import postcss from "postcss";
import nested from "postcss-nested";
import tailwind from "tailwindcss";
import typography from "@tailwindcss/typography";

export async function compileSelectors() {
  const input = await fs.readFile(
    new URL("selectors-input.css", import.meta.url),
    "utf8",
  );
  const result = await postcss([
    nested,
    tailwind({
      content: [
        {
          raw: "<article class=\"prose prose-invert prose-headings:font-bold hover:text-red-500 dark:hover:text-white group-hover:underline peer-checked:block [&>a:hover]:text-blue-500 [&:is(.a,.b)]:p-2 before:content-['x'] sm:focus-visible:ring-2\"></article>",
        },
      ],
      plugins: [typography],
      darkMode: "class",
      corePlugins: { preflight: false },
    }),
  ]).process(input, { from: undefined });
  return result.css;
}
