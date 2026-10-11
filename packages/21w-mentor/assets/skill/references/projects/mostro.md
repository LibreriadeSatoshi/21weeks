# Overlay de proyecto — Mostro

> Generado desde `contracts/catalog.ts` + `api/ai/mentors.ts` de la web
> 21weeks. No editar a mano: el cambio se hace en la fuente y se regenera.

- **Repo**: `MostroP2P/mostro`
- **Lenguajes**: "Rust"
- **Tracks**: "lightning", "p2p", "privacy"

peer-to-peer bitcoin exchange daemon — Lightning holds the sats (hold invoices), Nostr carries the messages. Rust. Before coding, the user must understand the order lifecycle (take/buy/sell, disputes, ratings) and the Mostro protocol messages over Nostr — use the readNostrDoc tool for event kinds and tags. Privacy-critical and money-critical: the dispute and escrow logic must be deeply understood, never blindly generated. The repo has its own AGENTS.md — follow it. Culture: active, welcoming to contributors, mutation testing in CI (mutants) — tests matter a lot.
