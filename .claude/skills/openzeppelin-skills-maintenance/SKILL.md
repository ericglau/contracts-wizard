---
name: openzeppelin-skills-maintenance
description: |
  Guide for maintaining the openzeppelin-* skills in this repository. Use when: (1) A new language/ecosystem is added to Contracts Wizard and needs a corresponding skill, (2) New contract types or features are added to an existing language, (3) Skills need updating to match codebase changes, (4) Periodic review to prevent skill staleness, (5) Understanding how skills are structured and where information comes from.
---

# OpenZeppelin Skills Maintenance Guide

This skill documents how to maintain the `openzeppelin-*` skills that help users write secure smart contracts.

## Skills Overview

| Skill | Location | Purpose |
|-------|----------|---------|
| `openzeppelin-contracts` | `.claude/skills/openzeppelin-contracts/` | Master routing skill |
| `openzeppelin-solidity` | `.claude/skills/openzeppelin-solidity/` | Solidity/EVM contracts |
| `openzeppelin-cairo` | `.claude/skills/openzeppelin-cairo/` | Cairo/Starknet contracts |
| `openzeppelin-stellar` | `.claude/skills/openzeppelin-stellar/` | Stellar/Soroban contracts |
| `openzeppelin-stylus` | `.claude/skills/openzeppelin-stylus/` | Arbitrum Stylus contracts |

## Information Sources

Skills derive their content from the Contracts Wizard codebase:

### Primary Sources

| Source | Location | What It Provides |
|--------|----------|------------------|
| Contract builders | `packages/core/{lang}/src/{type}.ts` | Feature options, composition logic, defaults |
| Access control | `packages/core/{lang}/src/set-access-control.ts` | Access patterns per language |
| Upgradeability | `packages/core/{lang}/src/set-upgradeable.ts` | Upgrade patterns per language |
| Pausable | `packages/core/{lang}/src/add-pausable.ts` | Pause patterns per language |
| Test snapshots | `packages/core/{lang}/src/*.test.ts.md` | Working code examples |
| AI descriptions | `packages/common/src/ai/descriptions/*.ts` | Option descriptions |
| Print functions | `packages/core/{lang}/src/print.ts` | Output structure, inheritance order |

### Key Files by Language

**Solidity** (`packages/core/solidity/src/`):
- `erc20.ts`, `erc721.ts`, `erc1155.ts` - Token types
- `governor.ts` - Governance
- `account.ts` - ERC-4337
- `stablecoin.ts` - Stablecoin features

**Cairo** (`packages/core/cairo/src/`):
- `erc20.ts`, `erc721.ts`, `erc1155.ts` - Token types
- `governor.ts` - Governance
- `account.ts`, `multisig.ts`, `vesting.ts` - Other types
- `common-components.ts` - Component system

**Stellar** (`packages/core/stellar/src/`):
- `fungible.ts`, `non-fungible.ts` - Token types
- `stablecoin.ts` - Stablecoin features
- `contract.ts` - Base contract logic

**Stylus** (`packages/core/stylus/src/`):
- `erc20.ts`, `erc721.ts`, `erc1155.ts` - Token types

**Uniswap Hooks** (`packages/core/uniswap-hooks/src/`):
- `hooks.ts` - Hook types and permissions

---

## Adding a New Language Skill

When a new language is added to Contracts Wizard:

### Step 1: Explore the New Language Package

```bash
# Find the new package
ls packages/core/

# Examine structure
ls packages/core/{new-lang}/src/

# Find contract types
grep -l "export function print" packages/core/{new-lang}/src/*.ts

# Find test snapshots
find packages/core/{new-lang} -name "*.test.ts.md"
```

### Step 2: Identify Key Patterns

Read these files to understand the language's patterns:

1. **Contract builder** (`{type}.ts`) - Options interface, `build*()` function
2. **Access control** (`set-access-control.ts`) - Available patterns
3. **Upgradeability** (`set-upgradeable.ts` or `add-upgradeable.ts`) - If exists
4. **Print function** (`print.ts`) - Output structure

### Step 3: Create Skill Directory

```bash
mkdir -p .claude/skills/openzeppelin-{new-lang}/references
```

### Step 4: Create SKILL.md

Template:
```markdown
---
name: openzeppelin-{new-lang}
description: |
  Build secure {Language} smart contracts for {Platform} using OpenZeppelin Contracts.
  Use when users ask about: (1) {Platform} contracts, (2) Token types available,
  (3) Access control patterns, (4) Language-specific features.
---

# OpenZeppelin {Language} Contracts

Build secure smart contracts for {Platform} using {Language}.

## Installation

[Package manager instructions]

## Contract Types

| Type | Description | Reference |
|------|-------------|-----------|
| ... | ... | [tokens.md](references/tokens.md) |

## Quick Start

[Minimal working example]

## Reference Files

| Topic | File |
|-------|------|
| Installation | [installation.md](references/installation.md) |
| Tokens | [tokens.md](references/tokens.md) |
| Access Control | [access-control.md](references/access-control.md) |
```

### Step 5: Create Reference Files

Required references:
- `installation.md` - Package setup, imports
- `tokens.md` - All token types for the language
- `access-control.md` - Available access patterns

Optional (if supported):
- `upgradeability.md` - Upgrade patterns
- `governance.md` - If governor/multisig supported

### Step 6: Update Master Skill

Edit `.claude/skills/openzeppelin-contracts/SKILL.md`:
1. Add language to "Language Selection" table
2. Add to "Contract Types by Language" table
3. Add to "Access Control Options" table
4. Update feature matrix reference

### Step 7: Update Feature Matrix

Edit `.claude/skills/openzeppelin-contracts/references/feature-matrix.md`:
1. Add columns for new language in all tables
2. Document which features are supported

---

## Adding New Contract Types

When a new contract type is added (e.g., new token standard):

### Step 1: Locate the Implementation

```bash
# Find the new contract builder
ls packages/core/{lang}/src/*.ts

# Read the options interface
grep -A 50 "interface.*Options" packages/core/{lang}/src/{new-type}.ts
```

### Step 2: Understand the Features

Extract from the builder file:
- Options interface fields
- Default values
- `isAccessControlRequired()` function
- Feature dependencies/incompatibilities

### Step 3: Find Examples

```bash
# Locate test snapshots
find packages/core/{lang} -name "*{new-type}*.test.ts.md"

# Read generated examples
cat packages/core/{lang}/src/{new-type}.test.ts.md
```

### Step 4: Update tokens.md

Add a new section with:
- Basic example
- Available features table
- Feature-specific examples
- Any incompatibilities or dependencies

### Step 5: Update SKILL.md

Add the new type to:
- Contract Types table
- Quick reference if commonly used

---

## Adding New Features to Existing Types

When new features are added (e.g., new ERC20 extension):

### Step 1: Identify the Change

```bash
# Check git diff for the contract builder
git diff packages/core/{lang}/src/{type}.ts

# Check for new options
grep -A 5 "interface.*Options" packages/core/{lang}/src/{type}.ts
```

### Step 2: Understand Feature Behavior

Check in the builder:
- Is access control required? (`isAccessControlRequired()`)
- Are there dependencies? (e.g., Votes requires Permit)
- Are there incompatibilities?
- What imports are needed?

### Step 3: Update Reference File

In `references/tokens.md` or relevant file:
1. Add feature to "Available Features" table
2. Add code example if non-trivial
3. Document any dependencies or constraints

### Step 4: Update Snapshots Examples

If test snapshots changed, update skill examples to match.

---

## Preventing Staleness

### Automated Checks (Recommended)

Add to CI pipeline:

```yaml
# .github/workflows/skills-check.yml
name: Skills Freshness Check
on:
  push:
    paths:
      - 'packages/core/**'
jobs:
  check-skills:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check for skill updates needed
        run: |
          # Compare contract builder timestamps with skill timestamps
          # Alert if core packages changed but skills haven't
```

### Manual Review Triggers

Update skills when:

1. **New package version released** - Check changelogs for:
   - New contract types
   - New features/options
   - Breaking changes
   - New access control patterns

2. **Core package files modified**:
   - `packages/core/{lang}/src/*.ts` - Contract builders
   - `packages/core/{lang}/src/set-*.ts` - Feature modules
   - `packages/common/src/ai/descriptions/*.ts` - Descriptions

3. **Test snapshots changed**:
   - `packages/core/{lang}/src/*.test.ts.md` - Update examples

### Quarterly Review Checklist

- [ ] Compare skill features against current `packages/core/{lang}/src/`
- [ ] Verify all contract types documented
- [ ] Verify all options for each type documented
- [ ] Check test snapshots for new patterns
- [ ] Update code examples if syntax changed
- [ ] Verify installation instructions current
- [ ] Check for deprecated features to remove

---

## Skill Structure Standards

### SKILL.md Requirements

```yaml
---
name: openzeppelin-{lang}
description: |
  [First sentence: What it does]
  Use when users ask about: (1) ..., (2) ..., (3) ...
---
```

- Description must list specific triggers
- Keep under 500 words total
- Include Quick Start with working code
- Link to all reference files

### Reference File Standards

- Use tables for feature comparisons
- Include complete, working code examples
- Document dependencies explicitly
- Note incompatibilities in dedicated sections
- Keep examples minimal but complete

### Code Example Standards

- Must compile/work as shown
- Include all necessary imports
- Use realistic names (MyToken, not Foo)
- Show constructor arguments
- Match patterns from test snapshots

---

## Common Maintenance Tasks

### Update for New OpenZeppelin Contracts Version

1. Check release notes for changes
2. Update version numbers in installation docs
3. Update import paths if changed
4. Add new features
5. Mark deprecated features
6. Update code examples

### Sync with AI Descriptions

When `packages/common/src/ai/descriptions/{lang}.ts` changes:

1. Review new/changed descriptions
2. Ensure skill descriptions align
3. Update option explanations in references

### Fix Reported Issues

When users report skill issues:

1. Verify against current codebase
2. Check test snapshots for correct patterns
3. Update skill with corrections
4. Add clarification for common confusion

---

## File Locations Quick Reference

```
.claude/skills/
├── openzeppelin-contracts/
│   ├── SKILL.md                    # Master routing
│   └── references/
│       ├── security-checklist.md   # Cross-language security
│       └── feature-matrix.md       # Cross-language comparison
│
├── openzeppelin-{lang}/
│   ├── SKILL.md                    # Language entry point
│   └── references/
│       ├── installation.md         # Setup guide
│       ├── tokens.md               # All token types
│       ├── access-control.md       # Access patterns
│       ├── upgradeability.md       # Upgrade patterns (if supported)
│       └── governance.md           # Governance (if supported)

packages/core/{lang}/src/
├── {type}.ts                       # Contract builder (source of truth)
├── set-access-control.ts           # Access control patterns
├── set-upgradeable.ts              # Upgrade patterns
├── add-pausable.ts                 # Pausable patterns
├── print.ts                        # Output generation
└── *.test.ts.md                    # Example outputs
```
