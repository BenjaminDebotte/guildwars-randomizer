# Spec: Guild Wars 1 Skill Bar Randomizer

## Objective
Build a pure client-side web application for Guild Wars 1 (GW1) that generates randomized player skill bars (8 skills + attribute allocations) with deep mechanical sanity controls and exports 100% compliant in-game template codes (`[Skill Template Code]`).

The app challenges players with novel or restricted builds while preventing broken/dead skill interactions through configurable sanity filters (weapon coherence, combo chains, pet requirements, teardowns, stance/prep limits, and optimal attribute allocation math).

## Capability Map

| Module ID | Responsibility | Depends On |
|---|---|---|
| `gw1-data` | Canonical skill dataset, metadata tags (weapon, combo, pet, teardown, energy, campaign), and patch-proof compilation schema. | — |
| `gw1-template-codec` | Official bitstream Base64 encoder and decoder for Guild Wars 1 skill template codes (`ABJR...`). Operates on primitive IDs. | — |
| `gw1-randomizer-engine` | Configurable generation engine: constructive candidate filtering, sanity rules, and attribute point optimization math (200 AP budget). | `gw1-data`, `gw1-template-codec` |
| `gw1-web-ui` | Interactive user interface: 8-skill bar with icons & tooltips, lock/reroll controls, rule configuration panel, and one-click copy. | `gw1-randomizer-engine`, `gw1-template-codec` |

Build Order: `gw1-template-codec` → `gw1-data` → `gw1-randomizer-engine` → `gw1-web-ui`

---

## Tech Stack
- **Runtime / Framework:** React 19 + TypeScript (Strict mode) + Vite
- **Styling:** Tailwind CSS + Lucide Icons (or custom GW-styled SVGs)
- **Testing:** Vitest for unit & property testing
- **Deployment:** Fully static SPA (zero backend, zero database, offline-capable, GitHub Pages deployable)

---

## Commands
```bash
# Development server
npm run dev

# Run unit and constraint tests
npm test

# Run tests with coverage
npm run test:coverage

# Type check
npm run typecheck

# Production build
npm run build

# Preview production build
npm run preview
```

---

## Project Structure
```
gw1-randomizer/
├── docs/
│   ├── intent/
│   │   └── gw1-skill-randomizer.md
│   └── SPEC.md
├── scripts/
│   └── compile-skill-data.ts        # Parses/validates raw skill data & compiles JSON
├── src/
│   ├── data/
│   │   ├── skills.json              # Bundled skill database (ids, names, stats, flags)
│   │   ├── attributes.ts            # Attribute constants, indices & cost progression
│   │   └── professions.ts           # Profession constants, indices & primary attributes
│   ├── core/
│   │   ├── codec/                   # Bitwise GW1 Base64 template encoder/decoder
│   │   │   ├── bitstream.ts
│   │   │   ├── templateCodec.ts
│   │   │   └── templateCodec.test.ts
│   │   ├── allocator/               # 200 Attribute Point optimization math
│   │   │   ├── attributeAllocator.ts
│   │   │   └── attributeAllocator.test.ts
│   │   └── generator/               # Randomizer constraint engine & sanity rules
│   │       ├── types.ts
│   │       ├── constraints.ts
│   │       ├── randomizer.ts
│   │       └── randomizer.test.ts
│   ├── components/                  # User Interface
│   │   ├── SkillBar.tsx             # 8-slot visual skill bar with GW borders
│   │   ├── SkillSlot.tsx            # Slot with lock/reroll & elite border
│   │   ├── SkillTooltip.tsx         # In-game styled hover tooltip
│   │   ├── AttributePanel.tsx       # Display & manual adjustments for attributes
│   │   ├── FilterPanel.tsx          # Profession, campaign, sanity options
│   │   └── CodeExportModal.tsx      # One-click copy template code
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Code Style
- **TypeScript:** Strict type checking (`noImplicitAny`, `strictNullChecks`). No `@ts-ignore` or `any`.
- **Pure Core Logic:** Keep codec, attribute allocator, and randomizer engine completely pure functions without DOM or React dependencies, thoroughly unit-tested.
- **Example Snippet:**
```typescript
## Bitstream Base64 Codec Specification
The bitstream is interpreted in **lowest-bit-first** order, encoded in RFC 4648 Base64:
1. **Header:**
   - 4 bits: Template Type = `14` (`0xE`)
   - 4 bits: Version = `0`
2. **Professions:**
   - 2 bits: Profession bit-width code $p \implies \text{bits\_per\_prof} = 2 \times p + 4$
   - $\text{bits\_per\_prof}$ bits: Primary Profession ID (0-10)
   - $\text{bits\_per\_prof}$ bits: Secondary Profession ID (0-10)
3. **Attributes:**
   - 4 bits: Non-zero attribute count $n$
   - 4 bits: Attribute bit-width code $a \implies \text{bits\_per\_attr} = a + 4$
   - For each of the $n$ attributes:
     - $\text{bits\_per\_attr}$ bits: Attribute ID (0-44)
     - 4 bits: Attribute Rank (1-12; attributes with rank 0 are omitted)
4. **Skills:**
   - 4 bits: Skill bit-width code $s \implies \text{bits\_per\_skill} = s + 8$
   - For each of the 8 skill slots:
     - $\text{bits\_per\_skill}$ bits: Skill ID (0 for empty slot)
5. **Tail:**
   - 1 bit: `0` (terminator bit)
   - Zero-pad bitstream to full 6-bit Base64 character boundary.

```typescript
export interface TemplateData {
  primaryProfession: ProfessionId;
  secondaryProfession: ProfessionId;
  attributes: Array<{ attributeId: AttributeId; rank: number }>;
  skills: [number, number, number, number, number, number, number, number];
}
```

---

## Canonical Skill Model (`Gw1Skill`)
```typescript
export interface Gw1Skill {
  id: number;
  name: string;
  profession: ProfessionId;
  attribute: AttributeId | null; // null for Common/Signets
  campaign: CampaignId;
  isElite: boolean;
  isPvEOnly: boolean;
  type: SkillType;
  target?: 'Self' | 'Ally' | 'Enemy' | 'Touched' | 'Corpse' | 'Spirit' | 'Pet';
  
  // Resource Costs & Timing
  energy: number;
  adrenaline?: number;    // 1-10 strikes
  activation: number;     // seconds (0 = instant / flash)
  recharge: number;       // seconds
  sacrifice?: number;     // % max health
  overcast?: number;      // energy exhaustion
  upkeep?: number;        // energy degeneration

  // Mechanical Sanity Flags
  weaponRequirement?: WeaponRequirement;
  comboChainStep?: 'Lead' | 'Offhand' | 'Dual';
  isPetEnabler?: boolean; // Charm Animal, Comfort Animal, Heal as One
  requiresPet?: boolean;  // Specific pet attacks/commands
  isTeardown?: boolean;   // Removes active enchantment
  isFlashEnchantment?: boolean; // Fast recharge <= 10s & self-targeted
  isForm?: boolean;       // Avatars / Transformations (max 1)
  isShieldSkill?: boolean;// Requires shield
  description: string;
}
```

---

## Sanity & Game Mechanics Rules (Enforced Invariants)

1. **PvE-Only Skill Limit (Hard Engine Rule):** Maximum 3 PvE-only skills per skill bar.
2. **Elite Skill Limit (Hard Engine Rule):** Maximum 1 Elite skill per skill bar.
3. **Weapon Exclusivity & Coherence:**
   - All weapon-specific attacks must share the chosen weapon type (Sword, Axe, Hammer, Bow, Spear, Scythe, Dagger). Generic melee attacks (`Melee Attack`) are compatible with any melee weapon.
   - Two-handed weapons (Hammer, Scythe, Bow, Staff) cannot be paired with shield-required skills (`isShieldSkill`).
4. **Assassin Combo Sequence:**
   - If a Dual Attack is present $\implies$ requires at least one Offhand Attack and one Lead Attack.
   - If an Offhand Attack is present $\implies$ requires at least one Lead Attack.
5. **Beast Mastery Pet Sanity:**
   - Skills with `requiresPet: true` strictly require a pet enabler (`isPetEnabler: true`).
   - Maximum 1 pet enabler per bar. Non-pet Beast Mastery skills (e.g. *Run as One*, nature rituals) are not restricted.
6. **Dervish Enchantment Teardown Sanity:**
   - Teardown skills require at least one low-recharge / flash self-enchantment (recharge $\le 10$s) so players do not accidentally strip their own 90-second Avatar elite.
7. **Resource & Energy Sanity (Low-Energy Primaries):**
   - Warrior primary (20 Max Energy, 2 pips): forbid skills costing $\ge 20$ energy; cap $\ge 15$ energy skills to max 1; forbid enchantments with upkeep $\ge 2$.
   - Secondary profession primary attributes (e.g. Energy Storage, Soul Reaping, Fast Casting) cannot be learned by secondary; secondary skills scaling purely with their locked primary attribute are excluded.
8. **Caps on Mutually Exclusive Mechanics:**
   - Stances: max 1–2 per bar.
   - Preparations: max 1 per bar.
   - Forms (Avatars/Shapeshifts): max 1 per bar.
   - Weapon Spells: max 1–2 per bar.
9. **Attribute Allocation & 200 AP Budget:**
   - Point costs: `[0:0, 1:1, 2:3, 3:6, 4:10, 5:15, 6:21, 7:28, 8:37, 9:48, 10:61, 11:77, 12:97]`.
   - Never exceeds 200 Attribute Points.
   - PvE Title Tracks (IDs 35–44) and attribute-less skills receive 0 points.
   - Primary profession's primary attribute is always eligible for points due to passive profession scaling (e.g. Fast Casting, Energy Storage, Strength).
   - Residual points (e.g. 5 or 7 leftover from 195/193) are invested into the Primary Attribute or primary utility line.
   - Omit rank 0 attributes from the encoded bitstream.
10. **Constructive Selection Engine:**
    - To guarantee generation times under 5ms, the randomizer builds bars incrementally by filtering invalid candidates at each slot rather than relying on rejection sampling.

---

## Boundaries
- **Always:**
  - Verify generated template codes decode accurately in round-trip tests.
  - Adhere to the strict 200 Attribute Point cap.
  - Keep skill database structured and metadata flags versioned/patch-proof.
- **Ask First:**
  - Adding heavy external runtime dependencies (beyond standard utility libraries).
  - Changing the core skill metadata JSON schema.
- **Never:**
  - Allow generation of template codes with invalid skills (>8, multiple elites, foreign professions).
  - Use server-side rendering or backend state that compromises static, offline client-side hosting.
  - Include external meta build crawlers / PvXWiki dependencies (the app is strictly an independent challenge randomizer).

---

## Success Criteria
- [ ] Valid GW1 template codes generated that paste directly into Guild Wars 1 client without syntax errors.
- [ ] Comprehensive sanity checks enforce weapon coherence, combo chains, pet enablers, and enchantment teardowns.
- [ ] Optimal auto-allocation of 200 attribute points matching the equipped skills.
- [ ] Interactive UI displays visual 8-skill bar with skill icons, detailed tooltips, and lock/reroll controls per slot.
- [ ] Filter panel allows locking primary/secondary profession, elite skill, campaigns (Core, Prophecies, Factions, Nightfall, EotN), and sanity rules.
- [ ] 100% test coverage on the codec and allocator core modules.

---

## Out of Scope
- Meta build databases and PvXWiki scrapers (focus is pure challenge randomizer).
- Multiplayer party team-builder coordinator.
- Direct game memory hooking or client injection.
