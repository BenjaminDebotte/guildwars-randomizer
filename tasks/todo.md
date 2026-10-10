# Tasks: Guild Wars 1 Skill Bar Randomizer

## Phase 1: Foundation & Data Pipeline

### Task 1: Project Scaffolding
**Description:** Initialize Vite + React 19 + TypeScript + Tailwind CSS + Vitest project configuration, scripts, and directory structure.
**Acceptance criteria:**
- [x] `package.json`, `tsconfig.json`, `vite.config.ts`, Tailwind configured
- [x] Vitest setup with test runner script in `package.json`
- [x] `npm run build` and `npm test` execute cleanly
**Verification:**
- [x] `npm test` runs without errors
- [x] `npm run build` succeeds
**Dependencies:** None
**Files likely touched:**
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `index.html`
- `src/App.tsx`
- `src/main.tsx`
**Estimated scope:** Medium (3-5 files)

---

### Task 2: Core Domain Constants & Schema
**Description:** Define TypeScript types and constants for Professions, Attributes, Attribute Costs, Skill schema, and Template representation in `src/data/`.
**Acceptance criteria:**
- [x] 10 professions defined with IDs (0-10) and primary attributes
- [x] 45 attributes defined with IDs (0-44), distinguishing profession attributes from PvE title tracks (IDs 35-44)
- [x] Attribute point cost table (ranks 0-12, cumulative cost 0-97) defined with helper methods
- [x] `Gw1Skill` interface defined with complete resource costs (`energy`, `adrenaline`, `activation`, `sacrifice`, `overcast`, `upkeep`), `type`, `target`, and sanity flags (`weaponRequirement`, `comboChainStep`, `isPetEnabler`, `requiresPet`, `isTeardown`, `isFlashEnchantment`, `isForm`, `isShieldSkill`)
**Verification:**
- [x] TypeScript typecheck passes with zero errors (`npm run typecheck`)
- [x] Unit test verifies attribute cost table matches official wiki numbers (Rank 12 = 97 pts)
**Dependencies:** Task 1
**Files likely touched:**
- `src/data/professions.ts`
- `src/data/attributes.ts`
- `src/data/types.ts`
**Estimated scope:** Small (2-3 files)

---

### Task 3: Complete Skill Database Pipeline
**Description:** Assemble the comprehensive GW1 skill database in `src/data/skills.json` using vetted open-source datasets (e.g. `@buildwars/gw-templates` / `Graphmaxer/gw1-mcp`), with scriptable mechanical tagging.
**Acceptance criteria:**
- [x] Database contains ~1,400+ official skills with verified Skill IDs matching the in-game template specification
- [x] Mechanical tagging script (`scripts/compile-skill-data.ts`) applies rule heuristics: combo steps (Lead/Offhand/Dual), pet enablers vs pet attacks, teardowns vs flash enchantments, weapon requirements, and forms
- [x] Unit test verifies no duplicate skill IDs and valid attribute/profession mappings
**Verification:**
- [x] Unit test in `src/data/skills.test.ts` validates data integrity
**Dependencies:** Task 2
**Files likely touched:**
- `scripts/compile-skill-data.ts`
- `src/data/skills.json`
- `src/data/skills.test.ts`
**Estimated scope:** Medium (3 files)

---

### Checkpoint: Foundation & Data
- [x] All tests pass: `npm test`
- [x] Types check: `npm run typecheck`
- [x] Skill dataset contains verified IDs matching GW1 wiki

---

## Phase 2: Template Codec & Attribute Allocator

### Task 4: BitStream and Base64 Codec
**Description:** Implement low-level bitstream writer/reader (`bitstream.ts`) and official GW1 template Base64 encoder/decoder (`templateCodec.ts`) decoupled from skill metadata.
**Acceptance criteria:**
- [x] `BitStreamWriter` and `BitStreamReader` support arbitrary bit-width integers with lowest-bit-first order
- [x] Bit-width calculations follow official formulas ($w_{\text{prof}} = 2p+4$, $w_{\text{attr}} = a+4$, $w_{\text{skill}} = s+8$)
- [x] Omit attributes with rank 0 from the serialized bitstream
- [x] `encodeSkillTemplate` and `decodeSkillTemplate` operate purely on `TemplateData` primitives
**Verification:**
- [x] Unit tests in `src/core/codec/bitstream.test.ts` verify bitwise operations
**Dependencies:** None
**Files likely touched:**
- `src/core/codec/bitstream.ts`
- `src/core/codec/bitstream.test.ts`
- `src/core/codec/templateCodec.ts`
**Estimated scope:** Medium (3 files)

---

### Task 5: Codec Round-Trip & Validation Tests
**Description:** Create comprehensive test suites for `templateCodec` using real GW1 template strings from the official wiki and edge cases.
**Acceptance criteria:**
- [x] Tests verify encoding then decoding returns identical template data (round-trip fidelity)
- [x] Tests verify decoding real in-game template strings (e.g. `OAhjYgH4ITOPWT5m8qX48A`)
- [x] Tests handle empty skill slots (skill ID 0) and mono-professions correctly
**Verification:**
- [x] `npm test src/core/codec/templateCodec.test.ts` passes
**Dependencies:** Task 4
**Files likely touched:**
- `src/core/codec/templateCodec.test.ts`
**Estimated scope:** Small (1 file)

---

### Task 6: 200 Attribute Point Mathematical Allocator
**Description:** Implement the attribute point allocation algorithm that optimizes the 200 point budget across the attributes used by the 8 rolled skills.
**Acceptance criteria:**
- [x] Never exceeds the 200 total Attribute Points budget
- [x] Ignores attribute-less skills (signets, PvE title skills) during frequency counting
- [x] Primary profession's primary attribute is always eligible for points due to passive profession scaling
- [x] Allocates points to active skill attributes; residual points ($\ge 3$ or $\ge 6$) absorbed by primary/utility attribute
- [x] Strictly excludes secondary profession's primary attribute (always 0)
- [x] Handles edge cases where active skill attributes $N < 2$ by falling back to primary + utility attribute
**Verification:**
- [x] Unit tests in `src/core/allocator/attributeAllocator.test.ts` verify budget limits and distribution logic
**Dependencies:** Task 2
**Files likely touched:**
- `src/core/allocator/attributeAllocator.ts`
- `src/core/allocator/attributeAllocator.test.ts`
**Estimated scope:** Small (2 files)

---

### Checkpoint: Codec & Allocator
- [x] Codec round-trip tests pass 100%
- [x] Allocator unit tests pass 100%
- [x] `npm test` passes

---

## Phase 3: Sanity Engine & Build Randomizer

### Task 7: Mechanical Sanity Rules & Constraint Solver
**Description:** Implement modular sanity constraint checkers (`constraints.ts`) for game mechanic coherence.
**Acceptance criteria:**
- [x] Hard client limit: maximum 3 PvE-only skills per bar
- [x] Hard client limit: maximum 1 Elite skill per bar
- [x] Weapon coherence: weapon-specific attacks share the same weapon type; generic melee attacks allowed; two-handed weapons forbid shield skills
- [x] Assassin combo sequence: Dual requires Offhand and Lead; Offhand requires Lead
- [x] Pet dependency: pet attack/command skills require a pet enabler; max 1 pet enabler per bar
- [x] Dervish teardowns: enchantment teardowns require at least one flash self-enchantment (recharge $\le 10$s)
- [x] Energy sanity: Warrior primary bans $\ge 20$e spells, caps $\ge 15$e to max 1; excludes skills scaling with secondary's primary attribute
- [x] Overwrite caps: max 1–2 stances, max 1 preparation, max 1 transformation form, max 1–2 weapon spells
- [x] Focus constraint: limits skills to at most 2 or 3 distinct attributes
**Verification:**
- [x] Unit tests in `src/core/generator/constraints.test.ts` verify every rule individually
**Dependencies:** Task 2, Task 3
**Files likely touched:**
- `src/core/generator/constraints.ts`
- `src/core/generator/constraints.test.ts`
**Estimated scope:** Medium (2 files)

---

### Task 8: Randomizer Engine Implementation
**Description:** Implement the full randomizer generator (`randomizer.ts`) using constructive candidate selection, slot locking, profession selection, campaign filtering, sanity rules, attribute allocation, and template code generation.
**Acceptance criteria:**
- [x] Constructive candidate selection: dynamically prunes invalid skills per slot to guarantee < 5ms generation
- [x] Supports locking primary/secondary profession or rolling randomly
- [x] Supports locking/rolling elite skill or leaving open
- [x] Supports locking individual skill slots
- [x] Filters skill pool by selected campaigns (Core, Prophecies, Factions, Nightfall, EotN) and PvE skill toggle
- [x] Satisfies all enabled sanity constraints
- [x] Calls attribute allocator to compute optimal ranks and generates template code
**Verification:**
- [x] Property test in `src/core/generator/randomizer.test.ts` running 1,000 randomized builds verifying 0 constraint violations
**Dependencies:** Task 6, Task 7
**Files likely touched:**
- `src/core/generator/randomizer.ts`
- `src/core/generator/types.ts`
- `src/core/generator/randomizer.test.ts`
**Estimated scope:** Medium (3 files)

---

### Checkpoint: Engine Complete
- [x] 1,000 build randomizer stress tests pass with zero errors
- [x] Build generation executes in < 5ms

---

## Phase 4: User Interface & Presentation

### Task 9: Visual Skill Bar & Slot Components
**Description:** Build the 8-slot visual `SkillBar` component with authentic Guild Wars framing, gold elite borders, empty slot indicators, and per-slot lock/reroll controls. Includes lazy-loaded icon CDN support with local SVG fallback.
**Acceptance criteria:**
- [x] Displays 8 skill slots horizontally with accurate styling
- [x] Highlights elite skill with gold border
- [x] Shows lock status icon and reroll button on each slot
- [x] Icon loading gracefully handles offline/errors with profession-colored SVG initials
- [x] Accessible keyboard navigation and mobile responsiveness
**Verification:**
- [x] Component renders correctly in dev server and tests
- [x] Automated component tests verify lock and reroll dispatching
**Dependencies:** Task 8
**Files likely touched:**
- `src/components/SkillBar.tsx`
- `src/components/SkillSlot.tsx`
- `src/components/SkillIcon.tsx`
**Estimated scope:** Medium (2-3 files)

---

### Task 10: In-Game Style Tooltip & Attribute Display
**Description:** Build hover/click `SkillTooltip` component mimicking the in-game GW1 skill card (energy, cast time, recharge, attribute, description) and `AttributePanel` showing allocated ranks out of 200 points.
**Acceptance criteria:**
- [x] Tooltip accurately displays energy cost, activation time, recharge, type, and description
- [x] Tooltip handles screen edges without clipping
- [x] `AttributePanel` displays all invested attributes, their point cost, and total points used (out of 200)
- [x] Allows manual increment/decrement of attribute ranks with budget enforcement
**Verification:**
- [x] Interactive testing in browser and automated component tests
**Dependencies:** Task 6, Task 9
**Files likely touched:**
- `src/components/SkillTooltip.tsx`
- `src/components/AttributePanel.tsx`
**Estimated scope:** Medium (2-3 files)

---

### Task 11: Configuration & Filter Panel
**Description:** Build `FilterPanel` allowing users to configure primary/secondary professions, campaigns, elite preference, and sanity rule presets.
**Acceptance criteria:**
- [x] Primary & Secondary profession selectors (with "Any / Random" option)
- [x] Campaign checkboxes (Core, Prophecies, Factions, Nightfall, Eye of the North)
- [x] PvE-only skills toggle
- [x] Sanity presets: "Chaos Mode" (no rules), "Recommended Sanity" (combo + weapon + pet + teardown + attribute focus), and "Custom" expandable checklist
- [x] "Roll Build" primary action button with keyboard shortcut (e.g. Spacebar or 'R')
**Verification:**
- [x] Changing filters immediately constrains subsequent rolls
**Dependencies:** Task 8, Task 9
**Files likely touched:**
- `src/components/FilterPanel.tsx`
**Estimated scope:** Medium (2 files)

---

### Task 12: Template Code Export & Import Modal
**Description:** Build `CodeExportModal` for copying the official GW1 template code to clipboard and pasting external codes to inspect and randomize from.
**Acceptance criteria:**
- [x] Displays the generated template code in a prominent box
- [x] "Copy Code" button with immediate clipboard copy and visual toast feedback
- [x] "Import Code" input that parses pasted GW1 template codes, populates the 8-skill bar and attributes, and flags any invalid skills
**Verification:**
- [x] Generated codes import successfully into GW1 (or verified through codec round-trip)
- [x] Pasting a valid code successfully populates the UI
**Dependencies:** Task 4, Task 9
**Files likely touched:**
- `src/components/CodeExportModal.tsx`
- `src/App.tsx`
**Estimated scope:** Small (2 files)

---

### Checkpoint: Complete Application
- [x] `npm run build` succeeds cleanly
- [x] `npm test` passes with 100% test success (47/47 tests)
- [x] End-to-end functionality verified: roll, lock, filter, copy code, import code
- [x] Strongly-typed enums for all game-relative integer IDs (`Profession`, `Campaign`, `Attribute`, `TemplateType`)
- [x] Shareable URL hash navigation and deep links (`#<TemplateCode>`)
- [x] Relative asset base path configuration for GitHub Pages
- [x] Automated GitHub Actions deployment pipeline (`.github/workflows/deploy.yml`)
