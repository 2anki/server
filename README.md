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
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#FF69B4', 'primaryTextColor': '#fff', 'primaryBorderColor': '#FF1493', 'lineColor': '#FF1493', 'secondaryColor': '#FFB6C1', 'tertiaryColor': '#FFF0F5', 'clusterBkg': '#FFF0F5', 'edgeLabelBackground': '#FFE4E1'}}}%%
flowchart TD
    IN([📨 Signal\nfeedback · issue · idea]):::signal

    subgraph trio ["💖 Product Trio 💖"]
        direction LR
        PM["🧠 PM\nsynthesize → spec → prioritize\n/triage-feedback · /spec"]:::pmNode
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

    classDef signal fill:#FF69B4,stroke:#FF1493,color:#fff,stroke-width:3px
    classDef pmNode fill:#FF1493,stroke:#C71585,color:#fff,stroke-width:3px
    classDef designerNode fill:#FF007F,stroke:#AD1457,color:#fff,stroke-width:3px
    classDef engineerNode fill:#E91E8C,stroke:#C71585,color:#fff,stroke-width:3px
    classDef prNode fill:#FFB6C1,stroke:#FF69B4,color:#880E4F,stroke-width:2px
    classDef shipNode fill:#FF1493,stroke:#880E4F,color:#fff,stroke-width:4px
```

The trio is powered by Claude subagents in `.claude/agents/`. Use `/trio <task>` to invoke all three in parallel on any prompt.

## Contributing

We'd love your help! See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to get started, run the test gate, and submit a PR.

## License

The code is licensed under the [MIT](./LICENSE) Copyright (c) 2020-2026, [Alexander Alemayhu](https://alemayhu.com). See [CREDITS.md](./CREDITS.md) for contributors.
