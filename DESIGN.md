# João Victor Dias — DESIGN.md

#JoaoVictor #Branding #Tecnologia

Referência visual: [Lawyer Portfolio Landing Page — Alex](https://jiro.build/templates/portfolio/lawyer-portfolio-landing-page-alex), inspecionada em 04/10/2026. Implementação própria em Astro com conteúdo e fotografias do JV. Estrutura editorial das teses inspirada em [Superhuman — Thesis](https://superhuman.fund/thesis).

## 1. Visual Theme & Atmosphere

Portfólio editorial escuro, com fotografia em preto e branco, tipografia Inter Tight em escala editorial e dourado. Hero com retrato à direita, apresentação à esquerda, nome grande na base e CTA inclinado. Seções numeradas, linhas finas, poucos contêineres fechados e bastante espaço entre assuntos.

## 2. Color Palette & Roles

- Fundo: `#10100f`.
- Superfície: `#171715`; seção de projetos: `#0b0b0a`.
- Dourado: `#d0a539`, para nome, números, links e CTAs.
- Texto: `#fbfbf8`; apoio: `#b5b5ad`.
- Bordas: `#33332e`; divisórias das teses: `#56503c`.

## 3. Typography Rules

Fonte local com licença SIL OFL: Inter Tight 400 para texto e 600 para títulos, nome, menu e destaques em todas as telas. No celular, títulos usam caixa de frase. Fallback: sans-serif.

| Papel        | Desktop    | Mobile   | Regra                                   |
| ------------ | ---------- | -------- | --------------------------------------- |
| Hero         | 42–66 px   | 34–40 px | Inter Tight 600; entrelinha 1,08–1,12   |
| Nome         | até 145 px | 9vw      | Inter Tight 600 em todas as telas       |
| Seção        | 38–70 px   | 30–40 px | Caixa alta no desktop; frase no celular |
| Texto        | 16–19 px   | 15–17 px | Entrelinha 1,6–1,7                      |
| Etiqueta/CTA | 10–12 px   | 10–12 px | Caixa alta, tracking discreto           |

## 4. Component Stylings

Botões dourados, texto preto, altura mínima de 52 px, cantos de 4 px. Links de leitura com seta. Cards de projeto sem caixa, fotografia acima da descrição. Accordion de atuação com item aberto dourado e conteúdo preto. Menu em dialog nativo: backdrop escuro, foco contido, fechamento por Escape e retorno de foco. Rodapé com frase em movimento e alternativa sem animação quando solicitada pelo sistema.

## 5. Layout Principles

Container de 1.180 px, expandido para 1.320 px em telas grandes. Margens de 56 px no desktop, 32 px em tablet e 20 px no celular. Seções com 110/80/65 px de padding vertical. Cabeçalhos de seção em duas colunas; sobre e contato com retrato/texto; teses e projetos em duas colunas; recursos em três.

## 6. Depth & Elevation

| Nível   | Tratamento        | Uso                   |
| ------- | ----------------- | --------------------- |
| Plano   | Sem sombra        | Seções e projetos     |
| Contido | Borda fina        | Credenciais e menu    |
| Elevado | Sombra escura     | CTA inclinado do hero |
| Modal   | Backdrop com blur | Navegação             |

## 7. Do's and Don'ts

Usar fotos reais do JV, preservar títulos profissionais precisos e separar convicções de evidências. Manter uma pergunta e uma direção por tese. Não inserir depoimentos, logos de clientes, resultados, preços ou vínculos institucionais fictícios do template. Não reutilizar fotos ou textos do advogado fictício. Links e conteúdo preexistentes permanecem acessíveis.

## 8. Responsive Behavior

- Até 767 px: coluna única, hero com altura automática, retrato abaixo da abertura e CTA horizontal no fluxo. Credencial lateral oculta e navegação modal rolável, inclusive em telas baixas.
- 768–1.050 px: margens menores, duas colunas quando viável, credencial lateral oculta.
- Acima de 1.050 px: composição completa do hero, colunas editoriais e credencial lateral.
- Controles principais com área de toque de ao menos 44 px; botões de ação de 52 px.
- Nome dimensionado com viewport; e-mail pode quebrar linha. Tabelas de CV e negócios rolam em contêiner próprio com instrução de deslizar e foco por teclado; o nome central do header some abaixo de 401 px. Respeitar `prefers-reduced-motion`.

## 9. Agent Prompt Guide

“Adapte o conteúdo preservando fundo preto, dourado, fonte Inter Tight, fotografia monocromática e seções numeradas. Use o hero da referência Alex como composição. Não invente números de sucesso ou depoimentos. Mantenha as teses em português e inglês com rotas próprias e links para cada tese.”

Arquivos centrais: `src/components/PortfolioShell.astro`, `PortfolioHome.astro`, `ThesesPage.astro`, `portfolio-content.ts` e `src/assets/styles/portfolio.css`. Conteúdo das teses em um único módulo para evitar divergência entre home e página completa.
