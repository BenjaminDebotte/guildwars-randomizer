# Implementation Plan: Guild Wars 1 Skill Bar Randomizer

## Overview
A high-performance, client-side web application for generating randomized Guild Wars 1 skill bars (8 skills + attribute allocations) with deep mechanical sanity controls and 100% compliant in-game template codes (`[Skill Template Code]`).

## Architecture Decisions
- **Client-Side Only (SPA):** Zero server infrastructure. All skill metadata, codec logic, attribute math, and randomizer algorithms execute in-browser with bundled JSON data.
- **Bitwise Base64 Codec:** Implement the exact official GW1 skill template bitstream specification (lowest-bit-first, 4-bit header `0xE`, variable bit-lengths for professions $2p+4$, attributes $a+4$, and skills $s+8$) to guarantee generated strings import directly into Guild Wars 1 without errors.
- **Mathematical Attribute Optimization:** A pure allocation algorithm that consumes the 8 selected skills and computes the optimal distribution of the 200 Attribute Point budget using non-linear GW1 cost progression (ranks 0–12). Correctly accounts for primary profession passive utility and attribute-less skills.
- **Constructive Constraint Solver:** To guarantee sub-5ms build generation, construct builds slot-by-slot with incremental candidate pruning (weapons, combos, pet enablers, teardowns, stances, preps, forms, PvE limits, and energy sanity) rather than naive whole-bar rejection sampling.
- **Prior Art & Clean Sourcing:** Leverage MIT-licensed GW1 data references (`@buildwars/gw-templates`, `Graphmaxer/gw1-mcp`) to ensure complete ~1,400+ skill IDs, official tooltips, and cost stats without manual transcription errors.

---

## Phase Breakdown

### Phase 1: Foundation & Data Pipeline
- Setup project with Vite + React 19 + TypeScript + Tailwind CSS + Vitest.
- Define domain models: Professions, Attributes, Attribute Costs, Skill schema.
- Assemble and validate the complete skill database with mechanical flags in `src/data/skills.json`.

### Checkpoint 1: Foundation & Data
- Project builds cleanly, types check, skill database is populated and validated.

### Phase 2: Template Codec & Attribute Allocator
- Build `BitStreamWriter` and `BitStreamReader` for variable-bit binary encoding.
- Implement official GW1 template Base64 encoder and decoder.
- Implement 200 Attribute Point allocator algorithm with rank cost scaling.
- Comprehensive unit tests against real GW1 template strings.

### Checkpoint 2: Codec & Math
- Codec passes round-trip tests for known builds.
- Allocator verifies invariants: never exceeds 200 AP, allocates only to relevant attributes.

### Phase 3: Sanity Engine & Build Randomizer
- Implement constraint rules: weapon coherence, combo sequences, pet enablers, teardowns, stance/prep caps.
- Implement randomizer engine with slot-locking, profession filtering, elite locking, and campaign availability.
- Property testing: 1,000 generated builds verified for zero constraint violations.

### Checkpoint 3: Engine Complete
- Randomizer generates complete builds (8 skills + attributes + template code) in < 5ms.

### Phase 4: User Interface & Experience
- Build 8-slot visual SkillBar with authentic Guild Wars framing and gold elite borders.
- Build in-game style SkillTooltip and interactive AttributePanel.
- Build FilterPanel for professions, campaigns, and sanity presets (Chaos, Recommended Sanity, Custom).
- Build CodeExportModal for one-click copy and build code import.

### Checkpoint 4: Complete Application
- End-to-end verification in browser.
- Production build passes with zero warnings.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| GW1 Base64 template encoding bit-alignment bug | High | Implement bitwise reader/writer with strict low-bit-first logic; test with real wiki template strings. |
| Insoluble constraint combinations (e.g. user locks incompatible skills) | Medium | Graceful fallback with user warning/highlight if user-locked constraints are mutually unsatisfiable. |
| Large skill database payload bloating bundle | Low | Pre-compile skill data into minimal optimized JSON structure (~150-250KB uncompressed, ~40KB gzipped). |
