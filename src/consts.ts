import type { Site, Page, Links, Socials } from "@types"

// Global
export const SITE: Site = {
  TITLE: "Lucas Rieneck Gottfried Pedersen",
  DESCRIPTION: "Portfolio of Lucas Rieneck Gottfried Pedersen — AI engineer working on applied ML, agentic systems and reinforcement learning.",
  AUTHOR: "Lucas Rieneck Gottfried Pedersen",
}

// Work Page
export const WORK: Page = {
  TITLE: "Work",
  DESCRIPTION: "Places I have worked.",
}

// Blog Page
export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION: "Writing on topics I am passionate about.",
}

// Projects Page 
export const PROJECTS: Page = {
  TITLE: "Projects",
  DESCRIPTION: "Recent projects I have worked on.",
}

// Search Page
export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION: "Search all posts and projects by keyword.",
}

// Links
export const LINKS: Links = [
  { 
    TEXT: "Home", 
    HREF: "/", 
  },
  { 
    TEXT: "Work", 
    HREF: "/work", 
  },
  { 
    TEXT: "Blog", 
    HREF: "/blog", 
  },
  { 
    TEXT: "Projects", 
    HREF: "/projects", 
  },
]

// Socials
export const SOCIALS: Socials = [
  {
    NAME: "Email",
    ICON: "email",
    TEXT: "lucasrgpedersen@pm.me",
    HREF: "mailto:lucasrgpedersen@pm.me",
  },
  {
    NAME: "Github",
    ICON: "github",
    TEXT: "LucasLista",
    HREF: "https://github.com/LucasLista",
  },
  {
    NAME: "LinkedIn",
    ICON: "linkedin",
    TEXT: "lucasrgpedersen",
    HREF: "https://www.linkedin.com/in/lucasrgpedersen/",
  },
  {
    NAME: "Bluesky",
    ICON: "bluesky",
    TEXT: "lucasrgpedersen.bsky.social",
    HREF: "https://bsky.app/profile/lucasrgpedersen.bsky.social",
  },
  {
    NAME: "X",
    ICON: "twitter-x",
    TEXT: "LucasRieneck",
    HREF: "https://x.com/LucasRieneck",
  },
]

