# joaovictordias.org

Site pessoal e currículo público de João Victor Dias. Construído com Astro sobre o
tema AstroWind, publicado em [joaovictordias.org](https://www.joaovictordias.org)
via GitHub Pages.

## Rodar localmente

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # gera dist/
npm run preview  # serve o build
```

Verificações: `npm run check` roda Astro e ESLint.

## Estrutura

- `src/pages/` as páginas, incluindo `cv.astro` e a versão inglesa em `en/cv.astro`
- `src/components/` componentes de interface
- `src/content/` conteúdo em Markdown
- `.github/workflows/deploy.yml` publica o `dist/` no GitHub Pages a cada push em `master`

O domínio é fixado pelo arquivo `CNAME`. Alterações no currículo devem ser feitas
nas duas versões, pt-BR e inglês, para que não divirjam.

<!-- MIGRACAO_HD_EXTERNO_SUPERJV -->

## Armazenamento local

Este projeto foi migrado em 2026-07-09 para o HD externo do Mac mini. O caminho
antigo em `~/Documents/GitHub` segue funcionando por symlink, então os comandos
acima rodam normalmente nos dois. O caminho exato do volume está registrado no
vault pessoal, fora deste repositório.
