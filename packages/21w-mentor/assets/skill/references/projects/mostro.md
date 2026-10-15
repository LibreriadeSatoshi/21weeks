# Overlay de proyecto — Mostro

> Generado desde `contracts/catalog.ts` (PROJECTS + CULTURE +
> MENTOR_ADDENDA + LEARNING_RESOURCES). No editar a mano:
> el cambio se hace en la fuente y se regenera con `npm run skill:overlays`.

- **Repo/host**: `MostroP2P/mostro` (github)
- **Lenguajes**: Rust
- **Tracks**: lightning, p2p, privacy
- **Dificultad**: 2/3 · **Roles**: developer, researcher
## URLs canónicas

- **Repo**: https://github.com/MostroP2P/mostro
- **Contributing**: https://github.com/MostroP2P/mostro/blob/main/CONTRIBUTING.md
- **Docs**: https://mostro.network/
- **Chat comunidad**: https://github.com/MostroP2P

## Reglas del mentor

peer-to-peer bitcoin exchange daemon — Lightning holds the sats (hold invoices), Nostr carries the messages. Rust. Before coding, the user must understand the order lifecycle (take/buy/sell, disputes, ratings) and the Mostro protocol messages over Nostr — use the readNostrDoc tool for event kinds and tags. Privacy-critical and money-critical: the dispute and escrow logic must be deeply understood, never blindly generated. The repo has its own AGENTS.md — follow it. Culture: active, welcoming to contributors, mutation testing in CI (mutants) — tests matter a lot.

## Recursos de aprendizaje curados

- [Bitcoin Core, LND y LNbits: de cero a infraestructura real / Bitcoin Core, LND & LNbits: zero to real infrastructure](https://moodle.libreriadesatoshi.com/course/view.php?id=24) — Running your own Core+LND stack is the best possible week 1 for any Lightning project. (niveles: beginner, intermediate; idioma: es)
- [Programando la red P2P de Bitcoin: construye tu propio nodo / Programming the Bitcoin P2P network: build your own node](https://moodle.libreriadesatoshi.com/course/view.php?id=38) — Understand the P2P protocol by building one: ideal before touching net_processing in Core. (niveles: intermediate; idioma: es)
- [Diplomatura de Privacidad en Bitcoin / Bitcoin Privacy Diploma](https://moodle.libreriadesatoshi.com/course/view.php?id=45) — On-chain privacy theory before contributing to JoinMarket or Fedimint. (niveles: beginner, intermediate; idioma: es)
- [Learn Cashu for Beginners / Learn Cashu for Beginners](https://moodle.libreriadesatoshi.com/course/view.php?id=14) — THE Cashu course: Chaumian ecash from scratch. Even for advanced devs, it's the fastest ramp into the protocol before touching Nutshell. Open to guests. (niveles: beginner, intermediate, advanced; idioma: es)
- [LN+AI: Lightning Network & Artificial Intelligence / LN+AI: Lightning Network & Artificial Intelligence](https://moodle.libreriadesatoshi.com/course/view.php?id=46) — The LN + agents intersection: machine-to-machine payments and L402. (niveles: intermediate; idioma: es)
- [De tu nodo a un observatorio: datos y observabilidad P2P / From your node to an observatory: P2P data & observability](https://moodle.libreriadesatoshi.com/course/view.php?id=47) — Monitoring the P2P network: researcher profile applied to network data. (niveles: intermediate; idioma: es)
- [Biblioteca de aprendizaje (The Bitcoin Dev Project) / Learn library (The Bitcoin Dev Project)](https://bitcoindevs.xyz/learn) — Guides, workshops and seminars curated by level: Chaincode, Optech, Base58… (niveles: beginner, intermediate, advanced; idioma: en)
- [Explorar proyectos BOSS del ecosistema / Explore ecosystem BOSS projects](https://bitcoindevs.xyz/contribute) — More Bitcoin open-source projects if our catalog runs short for you. (niveles: beginner, intermediate, advanced; idioma: en)
- [Get Funded: guía de grants para contributors / Get Funded: grants guide for contributors](https://bitcoindevs.xyz/get-funded) — OpenSats, Spiral, HRF, Brink…: for when your PRs already speak for you (week 21+). (niveles: intermediate, advanced; idioma: en)
