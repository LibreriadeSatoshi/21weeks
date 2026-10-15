/**
 * contracts/catalog.ts — Datos compartidos frontend ↔ backend.
 * Catálogo curado del ecosistema Bitcoin / Lightning (sin shitcoins),
 * tipos de perfil de usuario y tipos de issues / plan.
 */

export type Role = "developer" | "researcher";
export type Level = "beginner" | "intermediate" | "advanced";
export type Locale = "es" | "en";

export interface Profile {
  role: Role;
  level: Level;
  languages: string[];
  tracks: string[];
  hoursPerWeek: number;
}

export const TRACKS = [
  "consensus",
  "lightning",
  "wallets",
  "privacy",
  "p2p",
  "infra",
  "research",
  "docs",
] as const;

export type Track = (typeof TRACKS)[number];

export const LANGUAGES = [
  "C++",
  "C",
  "Rust",
  "Go",
  "Python",
  "TypeScript",
  "C#",
  "Kotlin",
  "Specs",
] as const;

export interface Project {
  id: string;
  name: string;
  tagline: { es: string; en: string };
  summary: { es: string; en: string };
  host: "github" | "gitlab";
  repo: string; // owner/repo o grupo/proyecto
  labels: string[]; // etiquetas de "good first issue" a consultar
  languages: string[];
  tracks: Track[];
  difficulty: 1 | 2 | 3; // 1 = amable para empezar, 3 = exigente
  roles: Role[];
  urls: {
    repo: string;
    contributing?: string;
    docs?: string;
    chat?: string;
    chatAlt?: string; // segundo canal (p.ej. Matrix dev junto a Telegram general)
  };
}

export const PROJECTS: Project[] = [
  {
    id: "bitcoin-core",
    name: "Bitcoin Core",
    tagline: { es: "La implementación de referencia", en: "The reference implementation" },
    summary: {
      es: "El cliente Bitcoin original y más usado. C++ con tests funcionales en Python. Revisión rigurosa, cultura de 'review antes que código'.",
      en: "The original and most widely used Bitcoin client. C++ with Python functional tests. Rigorous review culture — review before code.",
    },
    host: "github",
    repo: "bitcoin/bitcoin",
    labels: ["good first issue"],
    languages: ["C++", "Python"],
    tracks: ["consensus", "p2p", "wallets", "infra"],
    difficulty: 3,
    roles: ["developer", "researcher"],
    urls: {
      repo: "https://github.com/bitcoin/bitcoin",
      contributing: "https://github.com/bitcoin/bitcoin/blob/master/CONTRIBUTING.md",
      docs: "https://bitcoincore.reviews/",
      chat: "https://bitcoincore.reviews/",
    },
  },
  {
    id: "core-lightning",
    name: "Core Lightning",
    tagline: { es: "Implementación Lightning de Blockstream", en: "Blockstream's Lightning implementation" },
    summary: {
      es: "Nodo Lightning en C con plugins en Python. Modular, orientado a especificación y con una comunidad muy activa.",
      en: "Lightning node in C with Python plugins. Modular, spec-driven, with a very active community.",
    },
    host: "github",
    repo: "ElementsProject/lightning",
    labels: ["good first issue"],
    languages: ["C", "Python"],
    tracks: ["lightning", "infra"],
    difficulty: 2,
    roles: ["developer"],
    urls: {
      repo: "https://github.com/ElementsProject/lightning",
      contributing: "https://github.com/ElementsProject/lightning/blob/master/CONTRIBUTING.md",
      docs: "https://docs.corelightning.org/",
    },
  },
  {
    id: "lnd",
    name: "LND",
    tagline: { es: "Lightning Network Daemon en Go", en: "Lightning Network Daemon in Go" },
    summary: {
      es: "La implementación Lightning más desplegada, escrita en Go por Lightning Labs. Gran ecosistema de herramientas alrededor.",
      en: "The most deployed Lightning implementation, written in Go by Lightning Labs. Huge tooling ecosystem around it.",
    },
    host: "github",
    repo: "lightningnetwork/lnd",
    labels: ["good first issue"],
    languages: ["Go"],
    tracks: ["lightning", "p2p"],
    difficulty: 2,
    roles: ["developer"],
    urls: {
      repo: "https://github.com/lightningnetwork/lnd",
      contributing: "https://github.com/lightningnetwork/lnd/blob/master/docs/code_contribution_guidelines.md",
      docs: "https://docs.lightning.engineering/",
    },
  },
  {
    id: "ldk",
    name: "LDK (rust-lightning)",
    tagline: { es: "Lightning como librería en Rust", en: "Lightning as a Rust library" },
    summary: {
      es: "Lightning Dev Kit: una librería flexible en Rust para construir nodos y apps Lightning a medida.",
      en: "Lightning Dev Kit: a flexible Rust library to build custom Lightning nodes and apps.",
    },
    host: "github",
    repo: "lightningdevkit/rust-lightning",
    labels: ["good first issue"],
    languages: ["Rust"],
    tracks: ["lightning"],
    difficulty: 2,
    roles: ["developer"],
    urls: {
      repo: "https://github.com/lightningdevkit/rust-lightning",
      contributing: "https://github.com/lightningdevkit/rust-lightning/blob/main/CONTRIBUTING.md",
      docs: "https://lightningdevkit.org/",
    },
  },
  {
    id: "bdk",
    name: "BDK (Bitcoin Dev Kit)",
    tagline: { es: "Carteras Bitcoin en Rust, sin dolor", en: "Bitcoin wallets in Rust, painless" },
    summary: {
      es: "Librerías en Rust para construir carteras Bitcoin. Comunidad muy acogedora con nuevas personas y buen onboarding.",
      en: "Rust libraries to build Bitcoin wallets. A very welcoming community for newcomers with great onboarding.",
    },
    host: "github",
    repo: "bitcoindevkit/bdk",
    labels: ["good first issue"],
    languages: ["Rust", "Kotlin"],
    tracks: ["wallets"],
    difficulty: 1,
    roles: ["developer"],
    urls: {
      repo: "https://github.com/bitcoindevkit/bdk",
      contributing: "https://github.com/bitcoindevkit/bdk/blob/master/CONTRIBUTING.md",
      docs: "https://bitcoindevkit.org/",
    },
  },
  {
    id: "rust-bitcoin",
    name: "rust-bitcoin",
    tagline: { es: "Primitivas Bitcoin en Rust", en: "Bitcoin primitives in Rust" },
    summary: {
      es: "Librería base con tipos y primitivas de Bitcoin (transacciones, scripts, direcciones) escrita en Rust idiomático.",
      en: "Core library with Bitcoin types and primitives (transactions, scripts, addresses) in idiomatic Rust.",
    },
    host: "github",
    repo: "rust-bitcoin/rust-bitcoin",
    labels: ["good first issue"],
    languages: ["Rust"],
    tracks: ["consensus", "wallets"],
    difficulty: 2,
    roles: ["developer"],
    urls: {
      repo: "https://github.com/rust-bitcoin/rust-bitcoin",
      contributing: "https://github.com/rust-bitcoin/rust-bitcoin/blob/master/CONTRIBUTING.md",
      docs: "https://docs.rs/bitcoin/",
    },
  },
  {
    id: "electrum",
    name: "Electrum",
    tagline: { es: "La cartera clásica en Python", en: "The classic Python wallet" },
    summary: {
      es: "Cartera Bitcoin ligera y veterana, en Python. Ideal si vienes de scripting y quieres tocar protocolo, Lightning y UX.",
      en: "Veteran lightweight Bitcoin wallet in Python. Great if you come from scripting and want to touch protocol, Lightning and UX.",
    },
    host: "github",
    repo: "spesmilo/electrum",
    labels: ["good first issue"],
    languages: ["Python"],
    tracks: ["wallets", "lightning"],
    difficulty: 1,
    roles: ["developer"],
    urls: {
      repo: "https://github.com/spesmilo/electrum",
      contributing: "https://github.com/spesmilo/electrum/blob/master/CONTRIBUTING.md",
    },
  },
  {
    id: "btcpay",
    name: "BTCPay Server",
    tagline: { es: "Pagos Bitcoin autoalojados", en: "Self-hosted Bitcoin payments" },
    summary: {
      es: "Procesador de pagos Bitcoin/Lightning open source en C#. Perfecto si vienes del mundo web y .NET.",
      en: "Open source Bitcoin/Lightning payment processor in C#. Perfect if you come from web and .NET.",
    },
    host: "github",
    repo: "btcpayserver/btcpayserver",
    labels: ["good first issue"],
    languages: ["C#", "TypeScript"],
    tracks: ["wallets", "infra"],
    difficulty: 1,
    roles: ["developer"],
    urls: {
      repo: "https://github.com/btcpayserver/btcpayserver",
      contributing: "https://github.com/btcpayserver/btcpayserver/blob/master/CONTRIBUTING.md",
      docs: "https://docs.btcpayserver.org/",
    },
  },
  {
    id: "mempool",
    name: "mempool.space",
    tagline: { es: "Explorador y visualización del mempool", en: "Mempool explorer & visualization" },
    summary: {
      es: "El explorador de mempool más popular. Frontend Angular/TypeScript y backend Node. Visualización de datos en tiempo real.",
      en: "The most popular mempool explorer. Angular/TypeScript frontend and Node backend. Real-time data visualization.",
    },
    host: "github",
    repo: "mempool/mempool",
    labels: ["good first issue"],
    languages: ["TypeScript"],
    tracks: ["infra", "p2p"],
    difficulty: 1,
    roles: ["developer"],
    urls: {
      repo: "https://github.com/mempool/mempool",
      contributing: "https://github.com/mempool/mempool/blob/master/CONTRIBUTING.md",
    },
  },
  {
    id: "joinmarket",
    name: "JoinMarket",
    tagline: { es: "CoinJoin para la privacidad", en: "CoinJoin for privacy" },
    summary: {
      es: "Implementación de CoinJoin en Python para mejorar la privacidad on-chain. Criptografía aplicada y economía de mercado.",
      en: "CoinJoin implementation in Python to improve on-chain privacy. Applied cryptography and market economics.",
    },
    host: "github",
    repo: "JoinMarket-Org/joinmarket-clientserver",
    labels: ["good first issue"],
    languages: ["Python"],
    tracks: ["privacy", "wallets"],
    difficulty: 2,
    roles: ["developer", "researcher"],
    urls: {
      repo: "https://github.com/JoinMarket-Org/joinmarket-clientserver",
      contributing: "https://github.com/JoinMarket-Org/joinmarket-clientserver/blob/master/CONTRIBUTING.md",
      docs: "https://joinmarket-org.github.io/joinmarket-clientserver/",
    },
  },
  {
    id: "btcd",
    name: "btcd",
    tagline: { es: "Nodo completo Bitcoin en Go", en: "Full Bitcoin node in Go" },
    summary: {
      es: "Implementación alternativa de un nodo Bitcoin completo en Go, con una suite de librerías (btcutil, neutrino…).",
      en: "Alternative full Bitcoin node implementation in Go, with a suite of libraries (btcutil, neutrino…).",
    },
    host: "github",
    repo: "btcsuite/btcd",
    labels: ["good first issue"],
    languages: ["Go"],
    tracks: ["consensus", "p2p"],
    difficulty: 2,
    roles: ["developer"],
    urls: {
      repo: "https://github.com/btcsuite/btcd",
      contributing: "https://github.com/btcsuite/btcd/blob/master/docs/code_contribution_guidelines.md",
    },
  },
  {
    id: "fedimint",
    name: "Fedimint",
    tagline: { es: "Custodia federada y ecash", en: "Federated custody & ecash" },
    summary: {
      es: "Sistema federado de custodia comunitaria basado en ecash (Chaumian mints) escrito en Rust. Frontera de investigación aplicada.",
      en: "Federated community custody system based on ecash (Chaumian mints) written in Rust. Applied research frontier.",
    },
    host: "github",
    repo: "fedimint/fedimint",
    labels: ["good first issue"],
    languages: ["Rust"],
    tracks: ["privacy", "wallets", "research"],
    difficulty: 3,
    roles: ["developer", "researcher"],
    urls: {
      repo: "https://github.com/fedimint/fedimint",
      contributing: "https://github.com/fedimint/fedimint/blob/master/CONTRIBUTING.md",
      docs: "https://fedimint.org/",
    },
  },
  {
    id: "bolts",
    name: "BOLTs (Lightning Spec)",
    tagline: { es: "La especificación de Lightning", en: "The Lightning specification" },
    summary: {
      es: "Basis of Lightning Technology: el estándar que implementan todos los nodos Lightning. Trabajo de especificación, no de código.",
      en: "Basis of Lightning Technology: the standard every Lightning node implements. Specification work, not code.",
    },
    host: "github",
    repo: "lightning/bolts",
    labels: ["good first issue", "documentation"],
    languages: ["Specs"],
    tracks: ["lightning", "research", "docs"],
    difficulty: 2,
    roles: ["researcher"],
    urls: {
      repo: "https://github.com/lightning/bolts",
      contributing: "https://github.com/lightning/bolts/blob/master/CONTRIBUTING.md",
      docs: "https://github.com/lightning/bolts/blob/master/00-introduction.md",
    },
  },
  {
    id: "nips",
    name: "Nostr NIPs",
    tagline: { es: "Estándares del protocolo Nostr", en: "Nostr protocol standards" },
    summary: {
      es: "Nostr Implementation Possibilities: el repositorio de estándares del protocolo Nostr. Diseño de protocolo y debate técnico.",
      en: "Nostr Implementation Possibilities: the standards repo of the Nostr protocol. Protocol design and technical debate.",
    },
    host: "github",
    repo: "nostr-protocol/nips",
    labels: ["good first issue", "documentation"],
    languages: ["Specs", "TypeScript"],
    tracks: ["research", "docs", "infra"],
    difficulty: 1,
    roles: ["researcher", "developer"],
    urls: {
      repo: "https://github.com/nostr-protocol/nips",
      contributing: "https://github.com/nostr-protocol/nips/blob/master/CONTRIBUTING.md",
    },
  },
  {
    id: "vls",
    name: "Validating Lightning Signer",
    tagline: { es: "Firmado Lightning seguro", en: "Secure Lightning signing" },
    summary: {
      es: "VLS separa las claves del nodo Lightning en un dispositivo de firma validador. Rust, seguridad y hardware (proyecto en GitLab).",
      en: "VLS moves Lightning node keys into a validating signing device. Rust, security and hardware (GitLab project).",
    },
    host: "gitlab",
    repo: "lightning-signer/validating-lightning-signer",
    labels: ["good first issue"],
    languages: ["Rust"],
    tracks: ["lightning", "privacy"],
    difficulty: 3,
    roles: ["developer"],
    urls: {
      repo: "https://gitlab.com/lightning-signer/validating-lightning-signer",
      contributing: "https://gitlab.com/lightning-signer/validating-lightning-signer/-/blob/main/CONTRIBUTING.md",
      docs: "https://vls.tech/",
    },
  },
  {
    id: "nutshell",
    name: "Nutshell (Cashu)",
    tagline: { es: "Ecash Chaumiano sobre Bitcoin", en: "Chaumian ecash on Bitcoin" },
    summary: {
      es: "Wallet y mint de ecash Chaumiano para Bitcoin, en Python. Privacidad, Lightning y el protocolo Cashu (NUTs).",
      en: "Chaumian ecash wallet and mint for Bitcoin, in Python. Privacy, Lightning and the Cashu protocol (NUTs).",
    },
    host: "github",
    repo: "cashubtc/nutshell",
    labels: ["good first issue"],
    languages: ["Python"],
    tracks: ["privacy", "lightning", "wallets"],
    difficulty: 2,
    roles: ["developer", "researcher"],
    urls: {
      repo: "https://github.com/cashubtc/nutshell",
      contributing: "https://github.com/cashubtc/nutshell/blob/main/CONTRIBUTING.md",
      docs: "https://docs.cashu.space/",
      chat: "https://t.me/CashuBTC",
      chatAlt: "https://matrix.to/#/#dev:matrix.cashu.space",
    },
  },
  {
    id: "mostro",
    name: "Mostro",
    tagline: { es: "Exchange P2P sobre Nostr", en: "P2P exchange on Nostr" },
    summary: {
      es: "Plataforma de intercambio P2P de bitcoin sobre Lightning usando Nostr como capa de comunicación. Rust, privacidad y custodia minimizada.",
      en: "Peer-to-peer bitcoin exchange on Lightning using Nostr as the communication layer. Rust, privacy and minimized custody.",
    },
    host: "github",
    repo: "MostroP2P/mostro",
    labels: ["good first issue", "status: accepted"],
    languages: ["Rust"],
    tracks: ["lightning", "p2p", "privacy"],
    difficulty: 2,
    roles: ["developer", "researcher"],
    urls: {
      repo: "https://github.com/MostroP2P/mostro",
      contributing: "https://github.com/MostroP2P/mostro/blob/main/CONTRIBUTING.md",
      docs: "https://mostro.network/",
      chat: "https://github.com/MostroP2P",
    },
  },
];

// ---------- Issues ----------

export interface Issue {
  id: string; // host:repo:number
  projectId: string;
  number: number;
  title: string;
  url: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  comments: number;
  body: string; // recortado
  author?: string;
}

export interface RankedIssue {
  issueId: string;
  score: number; // 0-100
  reason: string;
}

// ---------- Plan 21 semanas ----------

export interface PlanWeek {
  week: number; // 1..21
  phase: string; // nombre corto de la fase
  title: string;
  objectives: string[];
  tasks: string[];
  resources: { label: string; url: string }[];
  outcome: string; // entregable de la semana
}

export interface Plan {
  projectId: string;
  projectName: string;
  generatedAt: string;
  issueId?: string;
  weeks: PlanWeek[];
  intro: string;
  graduation: string; // cómo se ve "ser contributor" al final
}
