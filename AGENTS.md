# AGENTS.md: Developer & AI Agent Operations Manual

This document provides operational guidelines, domain invariants, architecture rules, and evolution recipes for AI coding agents and engineers working in `guildwars-randomizer`.

---

## 1. System Overview & Core Philosophy

- **Stack:** React 19 + TypeScript (Strict) + Vite + Tailwind CSS v4 + Vitest.
- **Pure Client-Side Static Architecture:** Zero server dependencies, zero databases, zero third-party APIs at runtime. Everything runs entirely in-browser and is deployable to GitHub Pages.
- **Sub-2ms Generation Performance:** The randomizer relies on **constructive candidate pruning** per slot rather than naive whole-bar rejection sampling. Every roll must resolve in $< 5\text{ms}$.
- **100% In-Game Fidelity:** Generated template codes adhere strictly to ArenaNet's Guild Wars 1 Type 14 bitstream Base64 specification and import cleanly into the game client.

---

## 2. Inviolable Game Invariants

When editing, refactoring, or extending the generator, codec, or allocator, **never violate these rules**:

1. **200 Attribute Point Cap:** Level 20 characters have a hard cap of 200 Attribute Points. Cumulative rank costs follow the non-linear table:
   $$\text{Rank } 0 \to 12: [0, 1, 3, 6, 10, 16, 23, 31, 41, 53, 66, 81, 97]$$
2. **Primary Attribute Exclusivity:** The secondary profession's primary attribute (e.g., *Divine Favor* when secondary is Monk) **must never receive attribute points**.
3. **Hard Client Limits:**
   - Maximum **1 Elite skill** per bar.
   - Maximum **3 PvE-only skills** per bar.
4. **Weapon Coherence:** Weapon attacks must match the chosen weapon type. Generic melee attacks are allowed. Two-handed weapons (Hammer, Bow, Staff, Scythe) and Daggers forbid shield skills.
5. **Assassin Combo Sequence:** Dual attacks require an Offhand and a Lead attack in the bar. Offhand attacks require a Lead attack.
6. **Pet Dependency:** Pet attack and command skills require at least one pet enabler (*Charm Animal*, *Comfort Animal*, or *Heal as One*).
7. **Dervish Teardowns:** Teardown enchantments require at least one flash/low-recharge self-enchantment ($\le 10$s recharge).
8. **Low-Energy Restrictions:** Warrior primary restricts high-energy spells: $\ge 20$e spells are banned, and $\ge 15$e skills are capped to at most 1.
9. **Buff Overwrites:** Caps mutually exclusive stances (max 1–2), preparations (max 1), transformation forms (max 1), and weapon spells (max 1–2).

---

## 3. Architecture & Module Boundaries

Maintain strict layer decoupling:

```
src/
├── data/           # Domain schemas, enums, canonical skill JSON, profession/attribute dictionaries
├── core/
│   ├── codec/      # Pure BitStream and Base64 template encoder/decoder (NO React / DOM dependencies)
│   ├── allocator/  # Pure 200 AP mathematical allocator (NO React / DOM dependencies)
│   └── generator/  # Pure constructive candidate solver & randomizer (NO React / DOM dependencies)
└── components/     # React presentation components, UI controls, tooltips, dialogs
```

### Type Discipline
- **Use Enums:** All game IDs must use strongly-typed enums from `src/data/types.ts`:
  - `Profession` (`Profession.Warrior`, `Profession.Assassin`, etc.)
  - `Attribute` (`Attribute.Strength`, `Attribute.FastCasting`, etc.)
  - `Campaign` (`Campaign.Core`, `Campaign.Factions`, etc.)
  - `TemplateType` (`TemplateType.Skill = 14`)
- **No `any` or `@ts-ignore`:** Maintain strict mode compliance. Use narrow unions and type guards.

---

## 4. Verification & Quality Gates

Run these verification commands before committing any change:

```bash
# 1. Typecheck
npm run typecheck

# 2. Run all unit, allocator, codec, constraint, and integration tests
npm test

# 3. Production build
npm run build
```

**Quality Bar:**
- All 47+ Vitest tests must pass.
- 0 TypeScript compiler errors (`tsc --noEmit`).
- Production build must succeed with clean gzip output.
- `src/core/generator/randomizer.test.ts` runs a 1,000-build property test asserting zero constraint violations across randomized builds. Any change to candidate selection must maintain 100% pass rate.

---

## 5. Maintenance & Evolution Recipes

### A. How to Add a New Sanity Constraint
1. **Define Configuration:**
   - In `src/core/generator/constraints.ts`, add the rule flag to `SanityConfig`, `DEFAULT_SANITY_CONFIG`, and `CHAOS_SANITY_CONFIG`.
2. **Implement Candidate Pruning (`canAddSkill`):**
   - In `canAddSkill(currentSkills, candidate, config, primaryProf, secondaryProf)`, add the early-exit check to filter out invalid candidates during slot selection.
3. **Implement Bar Validation (`validateSkillBar`):**
   - In `validateSkillBar(skills, config, primaryProf, secondaryProf)`, verify the completed 8-slot bar and return descriptive error messages if violated.
4. **Write Unit Tests:**
   - In `src/core/generator/constraints.test.ts`, add dedicated tests verifying both rejection when invalid and acceptance when satisfied.
5. **Expose in UI:**
   - In `src/components/FilterPanel.tsx`, add the toggle to the "Custom" sanity preset accordion.

### B. How to Update or Recompile Skill Data
1. Skill data is generated via `@buildwars/gw-skilldata`.
2. To update or adjust mechanical heuristics (e.g. tagging new teardowns or weapon types):
   - Edit `scripts/compile-skill-data.ts`.
   - Run: `npx tsx scripts/compile-skill-data.ts`
   - Verify `src/data/skills.json` is updated and runs cleanly against `src/data/skills.test.ts`.

### C. How to Modify the Template Codec
- In `src/core/codec/bitstream.ts`, encoding uses **lowest-bit-first** bitwise order.
- In `src/core/codec/templateCodec.ts`, field widths follow:
  - Header: 4 bits type (`14`), 4 bits version (`0`)
  - Profession bit width: $2p + 4$
  - Attribute bit width: $a + 4$ (attributes with rank 0 are omitted)
  - Skill bit width: $s + 8$
  - 1-bit terminator (`0`) padded to Base64 6-bit boundary.
- Any codec change **must** verify round-trip fidelity with known in-game template strings in `src/core/codec/templateCodec.test.ts`.

---

## 6. CI/CD & GitHub Pages Deployment

- **Workflow File:** `.github/workflows/deploy.yml`
- **Node Runtime:** **Node.js 22+ (Active LTS)**. Do not downgrade to Node 20 (Node 20 causes `undici@8` inside `jsdom` to crash with `markAsUncloneable is not a function`).
- **Target Branch:** Deployment is restricted to branch `master` (the repository's default branch).
- **Asset Routing:** `vite.config.ts` uses `base: './'` to allow hosting in repository subpaths on GitHub Pages (`https://<user>.github.io/<repo>/`).
