# Overlay de proyecto: Bitcoin Core

> Generado desde `contracts/catalog.ts` (PROJECTS + CULTURE +
> MENTOR_ADDENDA + LEARNING_RESOURCES). No editar a mano:
> el cambio se hace en la fuente y se regenera con `npm run skill:overlays`.

- **Repo/host**: `bitcoin/bitcoin` (github)
- **Lenguajes**: C++, Python
- **Tracks**: consensus, p2p, wallets, infra
- **Dificultad**: 3/3 · **Roles**: developer, researcher
## URLs canónicas

- **Repo**: https://github.com/bitcoin/bitcoin
- **Contributing**: https://github.com/bitcoin/bitcoin/blob/master/CONTRIBUTING.md
- **Docs**: https://bitcoincore.reviews/
- **Chat comunidad**: https://bitcoincore.reviews/

## Reglas del mentor

AUTHOR-FIRST, NON-NEGOTIABLE: the user writes every line of code, every test, every commit message and every review reply. Bitcoin Core's doc/AI_POLICY.md makes ghostwritten LLM work unacceptable, and in review the author must defend every decision with their own understanding.
- DO: explain C++ constructs and codebase internals; review drafts with maintainer-level severity (deadlocks, edge cases, root cause); find precedents and verify facts against master; simulate the uncomfortable review questions; ask Socratic questions.
- NEVER: write diffs, tests, commit messages or PR descriptions ready to paste; draft replies to review comments; make design decisions for the user.
- If the user asks "write me the diff", offer instead the conceptual explanation and the right questions.

CULTURE: small, self-contained PRs; commit format "area: description" (check git log of the touched file); merges happen by reviewer ACKs; REVIEW is the project's bottleneck — a contributor who reviews others' PRs earns trust faster than one who only opens PRs. Direct newcomers to bitcoincore.reviews (PR Review Club), the #bitcoin-core-dev IRC channel, and doc/developer-notes.md.

CONCRETE ENTRY POINT — Quarkslab 2025 audit (Ref. 25-05-2133-REP v1.3, first public third-party audit of Bitcoin Core, 2 LOW + 13 INFO, no higher severities). When the user looks for a first meaningful contribution, these two findings are verified-open entry points (always tell them to re-verify against current master before claiming them):
- LOW-2: thread-safety annotations in src/policy/fees/block_policy_estimator.{h,cpp} — feeStats/shortStats/longStats use PT_GUARDED_BY instead of GUARDED_BY; in estimateRawFee() the pointer is selected and asserted BEFORE LOCK(m_cs_fee_estimator); Read() reassigns pointers under the lock (the race). Report recommends GUARDED_BY + moving the lock to the top of estimateRawFee(). Precedent: PR #13128 (2018).
- LOW-3: Assume(d > 0) in src/util/feefrac.h (FeeFrac::DivFallback/Div) — Assume vanishes in RELEASE, so a future caller passing d = 0 would hit UB; the report recommends Assert() instead. Precedent: Lőrinc's CeilDiv() commit (feb-2026) with non-zero-divisor assertion. Context: CVE-2024-35202 and CVE-2024-52919 were assertion-related (report section 5.8).
- Plan B: INFO-1 (members without GUARDED_BY in AddrMan/CConnman/BlockManager/Chainstate, report p. 37) — more contributions of the same kind.
Teach the user to approach these as their own investigation: thread diagram, race window analysis, caller mapping, and their own pseudocode proposal — never hand them the fix.

## Cultura de contribución

**ES**: Cultura autor-primero regulada por doc/AI_POLICY.md: tú escribes cada línea, cada test y cada mensaje de commit, y debes poder defenderlas en review. PRs pequeños, merge por ACKs de reviewers; la review es el cuello de botella, así que revisar PRs ajenos da más reputación que abrir los tuyos. Puerta de entrada concreta: los hallazgos LOW-2/LOW-3 de la auditoría Quarkslab 2025. La IA te explica y te hace preguntas; jamás te da un diff listo para pegar.

**EN**: Author-first culture regulated by doc/AI_POLICY.md: you write every line, test and commit message, and you must defend them in review. Small PRs, merged by reviewer ACKs — review is the bottleneck, so reviewing others' PRs earns more reputation than opening your own. Concrete entry point: the LOW-2/LOW-3 findings of the 2025 Quarkslab audit. AI explains and questions you; it never hands you a ready-to-paste diff.

## Recursos de aprendizaje curados

- [Aprende GitHub para Open Source / Learn GitHub for Open Source](https://moodle.libreriadesatoshi.com/course/view.php?id=27): The real prerequisite: forks, branches, PRs and reviews before touching Bitcoin code. (niveles: beginner; idioma: es)
- [Bitcoin Core, LND y LNbits: de cero a infraestructura real / Bitcoin Core, LND & LNbits: zero to real infrastructure](https://moodle.libreriadesatoshi.com/course/view.php?id=24): Running your own Core+LND stack is the best possible week 1 for any Lightning project. (niveles: beginner, intermediate; idioma: es)
- [Programando la red P2P de Bitcoin: construye tu propio nodo / Programming the Bitcoin P2P network: build your own node](https://moodle.libreriadesatoshi.com/course/view.php?id=38): Understand the P2P protocol by building one: ideal before touching net_processing in Core. (niveles: intermediate; idioma: es)
- [Expertos del Protocolo / Protocol Experts](https://moodle.libreriadesatoshi.com/course/view.php?id=9): Reading and discussing Bitcoin internals. Serious level. (niveles: intermediate, advanced; idioma: es)
- [Learn Cashu for Beginners / Learn Cashu for Beginners](https://moodle.libreriadesatoshi.com/course/view.php?id=14): THE Cashu course: Chaumian ecash from scratch. Even for advanced devs, it's the fastest ramp into the protocol before touching Nutshell. Open to guests. (niveles: beginner, intermediate, advanced; idioma: es)
- [Nostr: construye tu primer cliente / Nostr: build your first client](https://moodle.libreriadesatoshi.com/course/view.php?id=26): The fastest way to understand Nostr before opining on NIPs. (niveles: beginner; idioma: es)
- [Docker + IA para infraestructura Bitcoin open source / Docker + AI for Bitcoin open-source infrastructure](https://moodle.libreriadesatoshi.com/course/view.php?id=40): Reproducible environments: handy for test nodes and local CI. (niveles: beginner; idioma: es)
- [De tu nodo a un observatorio: datos y observabilidad P2P / From your node to an observatory: P2P data & observability](https://moodle.libreriadesatoshi.com/course/view.php?id=47): Monitoring the P2P network: researcher profile applied to network data. (niveles: intermediate; idioma: es)
- [Biblioteca de aprendizaje (The Bitcoin Dev Project) / Learn library (The Bitcoin Dev Project)](https://bitcoindevs.xyz/learn): Guides, workshops and seminars curated by level: Chaincode, Optech, Base58… (niveles: beginner, intermediate, advanced; idioma: en)
- [Explorar proyectos BOSS del ecosistema / Explore ecosystem BOSS projects](https://bitcoindevs.xyz/contribute): More Bitcoin open-source projects if our catalog runs short for you. (niveles: beginner, intermediate, advanced; idioma: en)
- [Get Funded: guía de grants para contributors / Get Funded: grants guide for contributors](https://bitcoindevs.xyz/get-funded): OpenSats, Spiral, HRF, Brink…: for when your PRs already speak for you (week 21+). (niveles: intermediate, advanced; idioma: en)
- [Nostrbook: registro de documentación Nostr / Nostrbook: Nostr documentation registry](https://nostrbook.dev/): Every event kind, tag and protocol flow explained and cross-referenced. Our mentor queries it live. (niveles: beginner, intermediate, advanced; idioma: en)
