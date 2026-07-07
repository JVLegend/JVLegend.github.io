import { getPermalink, getAsset } from "./utils/permalinks";

export const headerData = {
  links: [
    {
      text: "Sobre",
      href: getPermalink("/"),
    },
    {
      text: "CV",
      href: getPermalink("/cv"),
    },
    {
      text: "Negócios",
      href: getPermalink("/business"),
    },
    {
      text: "Palestras",
      href: getPermalink("/speaking"),
    },
    {
      text: "Livros",
      href: getPermalink("/books"),
    },
    {
      text: "Interesses",
      href: getPermalink("/interesses"),
    },
  ],
  actions: [
    { text: "Contato", href: getPermalink("/contact"), icon: "tabler:mail" },
  ],
};

export const headerDataEn = {
  links: [
    {
      text: "About",
      href: getPermalink("/en"),
    },
    {
      text: "CV",
      href: getPermalink("/en/cv"),
    },
    {
      text: "Business",
      href: getPermalink("/en/business"),
    },
  ],
  actions: [
    { text: "Contact", href: getPermalink("/en/contact"), icon: "tabler:mail" },
  ],
};

export const footerData = {
  links: [
    {
      title: "João Victor",
      links: [
        { text: "Sobre", href: getPermalink("/") },
        { text: "CV", href: getPermalink("/cv") },
        { text: "Contato", href: getPermalink("/contact") },
      ],
    },
    {
      title: "Ecossistema",
      links: [
        { text: "WingsAI", href: "https://www.wingsgroup.ai/" },
        { text: "IA para Médicos", href: "http://cursos.iaparamedicos.com.br/" },
        { text: "Palestras", href: getPermalink("/speaking") },
      ],
    },
    {
      title: "Recursos",
      links: [
        { text: "Livros Recomendados", href: getPermalink("/books") },
        { text: "Áreas de Interesse", href: getPermalink("/interesses") },
      ],
    },
  ],
  secondaryLinks: [
    { text: "Termos de Uso", href: getPermalink("/terms") },
    { text: "Privacidade", href: getPermalink("/privacy") },
  ],
  socialLinks: [
    {
      ariaLabel: "LinkedIn",
      icon: "tabler:brand-linkedin",
      href: "https://www.linkedin.com/in/joaovictordias",
    },
    {
      ariaLabel: "Twitter",
      icon: "tabler:brand-twitter",
      href: "https://twitter.com/joaovictor_ac",
    },
    {
      ariaLabel: "Github",
      icon: "tabler:brand-github",
      href: "https://github.com/jvlegend",
    },
    { ariaLabel: "RSS", icon: "tabler:rss", href: getAsset("/rss.xml") },
  ],
  footNote: `
    © ${new Date().getFullYear()} João Victor Pacheco Dias. Todos os direitos reservados.
  `,
};

export const footerDataEn = {
  links: [
    {
      title: "João Victor",
      links: [
        { text: "About", href: getPermalink("/en") },
        { text: "CV", href: getPermalink("/en/cv") },
        { text: "Contact", href: getPermalink("/en/contact") },
      ],
    },
    {
      title: "Ecosystem",
      links: [
        { text: "WingsAI", href: "https://www.wingsgroup.ai/" },
        { text: "IA para Médicos", href: "http://cursos.iaparamedicos.com.br/" },
        { text: "Business", href: getPermalink("/en/business") },
      ],
    },
  ],
  secondaryLinks: [
    { text: "Terms", href: getPermalink("/terms") },
    { text: "Privacy", href: getPermalink("/privacy") },
  ],
  socialLinks: footerData.socialLinks,
  footNote: `
    © ${new Date().getFullYear()} João Victor Pacheco Dias. All rights reserved.
  `,
};
