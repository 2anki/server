<p align="center">
  <img src="web/public/mascot/Notion 1.png" width="140" alt="2anki mascot" />
</p>

# 2anki.net

[2anki.net](https://2anki.net) helps you turn your Notion pages, HTML, Markdown, and other study material into Anki flashcards. Drop something in, get a clean `.apkg` deck back — no fuss.

## Why 2anki?

We're not replacing Anki or Notion — we're building a bridge between them. Drop in what you're studying, get a deck back.

- Free to use, no technical skills required
- Multi-format: Notion pages (via API or HTML export), Markdown, HTML, Excel (xlsx), zip bundles
- Toggle lists become cards, cloze deletions work out of the box
- Embeds, audio, images, code blocks, and LaTeX carried over
- Self-hostable if you hit the free-tier quota
- No VC funding — sustained by paying subscribers and lifetime users

## Getting started

```bash
git clone https://github.com/2anki/server.git
cd server
pnpm install
touch .env
pnpm dev
```

The server starts on `http://localhost:2020` and the frontend on `http://localhost:5173`. For server-only work: `pnpm dev:server`.

## How we develop

Every change that touches user-facing behavior goes through a **product trio**: a PM, a designer, and an engineer who consult in parallel — not in a handoff chain. The goal is to catch bad assumptions before engineering time is committed.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#E91E8C', 'primaryTextColor': '#880E4F', 'primaryBorderColor': '#AD1457', 'lineColor': '#C2185B', 'tertiaryColor': '#FFF0F5', 'clusterBkg': '#FFF0F5', 'edgeLabelBackground': '#FCE4EC', 'textColor': '#880E4F'}}}%%
flowchart TD
    IN([📨 Signal — feedback · issue · idea]):::signal

    subgraph trio ["💖 Product Trio 💖"]
        direction LR
        PM["🧠 PM\nsynthesize → spec → prioritize\n/triage-feedback  ·  /spec"]:::pmNode
        D["🎨 Designer\nflows · copy · visual hierarchy\n/review"]:::designerNode
        E["⚙️ Engineer\nfeasibility · TDD · /check\n/implement"]:::engineerNode

        PM -->|spec| D
        PM -->|spec| E
        D -->|UX sign-off| E
        E -.->|feasibility push-back| PM
    end

    PR(["📋 Pull Request\ntests · instrumentation · goal alignment"]):::prNode
    SHIP(["🚀 Ships to 2anki.net"]):::shipNode

    IN --> PM
    E --> PR --> SHIP
    SHIP -.->|metrics & feedback| IN

    classDef signal fill:#E91E8C,stroke:#AD1457,color:#fff,stroke-width:2px
    classDef pmNode fill:#AD1457,stroke:#880E4F,color:#fff,stroke-width:2px
    classDef designerNode fill:#C2185B,stroke:#880E4F,color:#fff,stroke-width:2px
    classDef engineerNode fill:#D81B60,stroke:#AD1457,color:#fff,stroke-width:2px
    classDef prNode fill:#FCE4EC,stroke:#E91E8C,color:#880E4F,stroke-width:2px
    classDef shipNode fill:#880E4F,stroke:#4A0028,color:#fff,stroke-width:3px
```

The trio is powered by Claude subagents in `.claude/agents/`. Use `/trio <task>` to invoke all three in parallel on any prompt.

## Contributing

We'd love your help! See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to get started, run the test gate, and submit a PR.

## License

The code is licensed under the [MIT](./LICENSE) Copyright (c) 2020-2026, [Alexander Alemayhu](https://alemayhu.com). See [CREDITS.md](./CREDITS.md) for contributors.
