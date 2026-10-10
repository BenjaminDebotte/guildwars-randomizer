# Guild Wars 1 Skill Bar Randomizer

A high-performance, client-side web application for generating randomized Guild Wars 1 skill bars (8 skills + attribute allocations) with deep mechanical sanity controls and **100% compliant in-game template codes** (`[Skill Template Code]`).

---

## Features

- **Deep Mechanical Sanity Rules:** Generates builds that are mechanically playable rather than unplayable noise:
  - **Weapon Coherence:** Weapon-specific attacks share the same weapon type; generic melee attacks allowed; two-handed weapons and daggers forbid shield skills.
  - **Assassin Combo Chains:** Dual attacks require an Offhand and a Lead attack; Offhand attacks require a Lead attack.
  - **Pet Dependency:** Pet command/attack skills require a pet enabler (*Charm Animal*, *Comfort Animal*, or *Heal as One*).
  - **Dervish Teardowns:** Enchantment teardowns require at least one flash self-enchantment (recharge $\le 10$s).
  - **Low-Energy Restrictions:** Warrior primary bans $\ge 20$ energy spells and caps $\ge 15$ energy skills to at most 1.
  - **Buff Overwrite Caps:** Caps mutually exclusive stances (max 1–2), preparations (max 1), transformation forms (max 1), and weapon spells (max 1–2).
  - **Hard Game Limits:** Maximum 1 Elite skill and maximum 3 PvE-only skills per bar.
- **200 Attribute Point Mathematical Allocator:**
  - Accurately computes rank costs according to the official non-linear GW1 progression table (ranks 0–12, cumulative cost 0–97 pts).
  - Optimizes active skill attributes and primary profession passive utility.
  - Strictly enforces that secondary profession primary attributes receive 0 points.
- **100% In-Game Compatible Base64 Template Codec:**
  - Generates official bitstream template codes (type 14 `0xE`, lowest-bit-first variable-width encoding).
  - Supports one-click clipboard copying and import of existing template codes (including `[Template Code]` and chat link `[Build Name;CODE]` formats).
- **Interactive Controls:**
  - **Slot-by-Slot Locking:** Pin any favorite skill slots and reroll only the remaining unpinned slots.
  - **Profession Filtering:** Choose specific primary and secondary professions or leave them as random.
  - **Campaign Filtering:** Enable/disable skills by campaign: Core, Prophecies, Factions, Nightfall, and Eye of the North.
  - **Sanity Presets:** Choose from **Recommended Sanity**, pure random **Chaos Mode**, or customize each individual constraint rule.
  - **Shareable Deep Links:** Every build automatically synchronizes with the URL hash (e.g. `#OwFj0xfzITOMMMHMie4O0kxZ6PA`), allowing direct bookmarking and sharing with friends.
  - **Keyboard Shortcut:** Press `Space` or `R` to roll a new build instantly.
  - **Offline/CDN Icon Fallback:** Loads high-resolution icons from the official wiki with automatic fallback to profession-colored initials badges.

---

## Getting Started

### Prerequisites

- Node.js 22+ (Active LTS)
- npm 10+

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/BenjaminDebotte/guildwars-randomizer.git
cd guildwars-randomizer

# Install dependencies
npm install

# Start local development server
npm run dev

# Run unit and component test suites (47 tests across 9 suites)
npm test

# Run TypeScript typecheck
npm run typecheck

# Build optimized production bundle
npm run build
```

---

## How to Use Template Codes in Guild Wars 1

1. Roll or customize a build in the web application.
2. Click **Copy Code** in the top navigation bar or **Export** modal.
3. In Guild Wars 1, press `K` to open the Skills & Attributes window.
4. Click the **Template** drop-down menu icon (floppy disk / page icon).
5. Select **Manage** → **Load template from code...** and paste your code (`Ctrl + V`).

---

## Architecture & Codebase Overview

```
gw1-randomizer/
├── src/
│   ├── data/
│   │   ├── types.ts          # Core domain interfaces, enums (Profession, Campaign, Attribute)
│   │   ├── professions.ts    # 10 professions, primary attributes, playable IDs
│   │   ├── attributes.ts     # 45 attributes, non-linear point cost table (0-97 pts)
│   │   ├── skills.ts         # Skill index and campaign/PvE filter helpers
│   │   └── skills.json       # 1,329 canonical GW1 skills with mechanical flags
│   ├── core/
│   │   ├── codec/
│   │   │   ├── bitstream.ts      # Low-level LSB-first variable bit-width writer/reader
│   │   │   └── templateCodec.ts  # Base64 template encoder and decoder
│   │   ├── allocator/
│   │   │   └── attributeAllocator.ts # 200 AP mathematical optimizer
│   │   └── generator/
│   │       ├── constraints.ts    # Modular mechanical sanity rule checkers
│   │       ├── randomizer.ts     # Constructive slot-by-slot generator (< 2ms)
│   │       └── types.ts          # Generator options and build schemas
│   ├── components/
│   │   ├── SkillBar.tsx          # 8-slot visual bar with gold elite border & lock controls
│   │   ├── SkillSlot.tsx         # Single skill card slot with hover tooltip trigger
│   │   ├── SkillIcon.tsx         # Wiki CDN image loader with SVG fallback
│   │   ├── SkillTooltip.tsx      # In-game authentic skill card with cost badges
│   │   ├── AttributePanel.tsx    # AP budget bar, rank meters (+/- rank controls)
│   │   ├── FilterPanel.tsx       # Profession, campaign, sanity preset filters
│   │   └── CodeExportModal.tsx   # Code copy, shareable link, and import modal
│   ├── App.tsx                   # State management, keyboard listeners, URL hash sync
│   └── main.tsx                  # Application entry point
├── scripts/
│   └── compile-skill-data.ts     # Skill compilation pipeline from @buildwars/gw-skilldata
└── .github/
    └── workflows/
        └── deploy.yml            # Automated GitHub Pages CI/CD deployment
```

---

## License

MIT
