import { getPermalink, getBlogPermalink, getAsset } from "./utils/permalinks";

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
      text: "Blog",
      href: getBlogPermalink(),
    },
  ],
  actions: [
    { text: "Contato", href: getPermalink("/contact"), icon: "tabler:mail" },
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
      title: "Negócios",
      links: [
        { text: "WingsAI", href: "https://www.wingsgroup.ai/" },
        { text: "I.A. para Médicos", href: "#" },
        { text: "Instituto Rumo ao Topo", href: "#" },
        { text: "Palestras", href: getPermalink("/speaking") },
      ],
    },
    {
      title: "Recursos",
      links: [
        { text: "Blog", href: getBlogPermalink() },
        { text: "Newsletter", href: "#" },
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
    © ${new Date().getFullYear()} João Victor Dias. Todos os direitos reservados.
  `,
};
