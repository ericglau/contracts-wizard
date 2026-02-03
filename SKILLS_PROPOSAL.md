# OpenZeppelin Smart Contract Skills Proposal

This document outlines a comprehensive proposal for AI skills to help developers write secure smart contracts using OpenZeppelin Contracts libraries across multiple languages and ecosystems.

## Executive Summary

The OpenZeppelin Contracts Wizard codebase contains deep expertise on how to compose secure smart contracts. This knowledge is embedded in:
- Code generation logic (feature composition, inheritance/component ordering)
- Validation rules (incompatibility checks, required dependencies)
- Test snapshots (working examples of feature combinations)
- AI descriptions (human-readable explanations of options)

This proposal defines a skill architecture that extracts and organizes this knowledge into modular, language-aware skills for AI assistants.

---

## Part 1: Overall Approach

### Philosophy

1. **Extract, Don't Duplicate**: Skills should reference patterns from the Wizard codebase rather than maintaining parallel documentation that can drift.

2. **Language-First Organization**: Each blockchain language (Solidity, Cairo, Stellar, Stylus) has fundamentally different paradigms. Skills must respect these differences.

3. **Progressive Complexity**: Start with installation and basics, advance to composition patterns, then to advanced topics like upgradeability.

4. **Security by Default**: Every skill should embed security best practices and warn about common pitfalls.

### Skill Architecture

```
openzeppelin-contracts/
├── SKILL.md                           # Master skill (routing + overview)
├── references/
│   ├── security-checklist.md          # Common security patterns
│   └── feature-matrix.md              # Cross-language feature comparison
│
├── solidity/
│   ├── SKILL.md                       # Solidity routing skill
│   ├── references/
│   │   ├── installation.md
│   │   ├── tokens.md                  # ERC20, ERC721, ERC1155
│   │   ├── governance.md              # Governor, Timelock
│   │   ├── access-control.md          # Ownable, Roles, Managed
│   │   ├── upgradeability.md          # UUPS, Transparent
│   │   ├── accounts.md                # ERC-4337
│   │   └── uniswap-hooks.md           # v4 Hooks
│   └── scripts/
│       └── validate-contract.ts       # Optional validation script
│
├── cairo/
│   ├── SKILL.md
│   └── references/
│       ├── installation.md
│       ├── components.md              # Component system explanation
│       ├── tokens.md
│       ├── governance.md
│       ├── access-control.md
│       └── upgradeability.md
│
├── stellar/
│   ├── SKILL.md
│   └── references/
│       ├── installation.md
│       ├── traits.md                  # Trait-based patterns
│       ├── tokens.md
│       └── access-control.md
│
└── stylus/
    ├── SKILL.md
    └── references/
        ├── installation.md
        ├── tokens.md
        └── access-control.md
```

---

## Part 2: Skill Categories

### Category 1: Master Routing Skill

**Name**: `openzeppelin-contracts`

**Purpose**: Entry point that routes to language-specific skills and provides cross-cutting guidance.

**Triggers**:
- "Help me write a smart contract"
- "OpenZeppelin contracts"
- "ERC20/ERC721/ERC1155 token"
- "Smart contract security"

**Contents**:
- Language selection guidance (which language for which use case)
- Cross-language feature matrix reference
- Security checklist reference
- Links to language-specific skills

---

### Category 2: Language-Specific Skills

Each language gets its own skill with consistent structure but language-appropriate content.

#### 2.1 Solidity Skill

**Name**: `openzeppelin-solidity`

**Triggers**:
- "Solidity contract"
- "EVM smart contract"
- "Ethereum/Polygon/Arbitrum/Base contract"
- Specific contract types: "ERC20", "Governor", "Account"

**Reference Files**:

| File | Content |
|------|---------|
| `installation.md` | npm/yarn install, Foundry remappings, Hardhat config |
| `tokens.md` | ERC20, ERC721, ERC1155 patterns and options |
| `governance.md` | Governor, Timelock, voting tokens |
| `access-control.md` | Ownable vs Roles vs Managed |
| `upgradeability.md` | UUPS vs Transparent, namespaced storage |
| `accounts.md` | ERC-4337 account abstraction |
| `uniswap-hooks.md` | Uniswap v4 hook patterns |

#### 2.2 Cairo Skill

**Name**: `openzeppelin-cairo`

**Triggers**:
- "Cairo contract"
- "Starknet contract"
- "Cairo components"

**Reference Files**:

| File | Content |
|------|---------|
| `installation.md` | Scarb setup, component imports |
| `components.md` | Component system, embedding, withComponents macro |
| `tokens.md` | ERC20, ERC721, ERC1155 with components |
| `governance.md` | Governor, Multisig, Vesting |
| `access-control.md` | Ownable, Roles, DAR (DefaultAdminRules) |
| `upgradeability.md` | ClassHash upgrades, assert_only_governance |

#### 2.3 Stellar Skill

**Name**: `openzeppelin-stellar`

**Triggers**:
- "Stellar contract"
- "Soroban contract"
- "Stellar token"

**Reference Files**:

| File | Content |
|------|---------|
| `installation.md` | Cargo setup, stellar-sdk |
| `traits.md` | Trait implementations, macros |
| `tokens.md` | Fungible, Non-Fungible (fixed 7 decimals) |
| `access-control.md` | Ownable, AccessControl traits |

#### 2.4 Stylus Skill

**Name**: `openzeppelin-stylus`

**Triggers**:
- "Stylus contract"
- "Arbitrum Stylus"
- "Rust EVM contract"

**Reference Files**:

| File | Content |
|------|---------|
| `installation.md` | Cargo setup, stylus-sdk |
| `tokens.md` | ERC20, ERC721, ERC1155 |
| `access-control.md` | Ownable, Roles |

---

### Category 3: Topic-Specific Skills

Cross-cutting topics that apply across languages.

#### 3.1 Security Skill

**Name**: `openzeppelin-security`

**Triggers**:
- "Smart contract security"
- "Audit checklist"
- "Security best practices"

**Contents**:
- Common vulnerabilities by contract type
- Access control patterns
- Reentrancy protection
- Upgrade safety

#### 3.2 Upgradeability Skill

**Name**: `openzeppelin-upgrades`

**Triggers**:
- "Upgradeable contract"
- "Proxy pattern"
- "UUPS/Transparent"

**Contents**:
- Language-specific upgrade patterns
- Storage layout rules
- Migration strategies

---

## Part 3: Detailed Skill Specifications

### 3.1 Solidity Token Skill (`references/tokens.md`)

**Topics to Cover**:

1. **ERC20**
   - Basic token (name, symbol)
   - Burnable (holder destruction)
   - Pausable (emergency stop)
   - Mintable (supply creation)
   - Permit (gasless approvals)
   - Votes (governance delegation)
   - Flash Minting (collateral-free loans)
   - Cross-chain Bridging (custom vs Superchain)
   - Callback (ERC1363)

2. **ERC721**
   - Basic NFT
   - Enumerable (on-chain enumeration)
   - URI Storage (per-token metadata)
   - Auto-increment IDs
   - Votes (governance)
   - Royalties (ERC2981)

3. **ERC1155**
   - Multi-token standard
   - Supply tracking
   - Updatable URI

**Feature Incompatibilities to Document**:
- Votes requires Permit (auto-enabled if Votes selected)
- UUPS requires access control
- Cross-chain bridging with premint requires chain ID

**Code References**:
- `packages/core/solidity/src/erc20.ts:118-126` - Votes/Permit dependency
- `packages/core/solidity/src/erc20.ts:81-83` - `isAccessControlRequired()`
- `packages/core/solidity/src/erc20.ts:209-220` - Cross-chain premint validation

---

### 3.2 Solidity Access Control Skill (`references/access-control.md`)

**Topics to Cover**:

1. **Ownable**
   - Single owner pattern
   - `onlyOwner` modifier
   - Constructor: `initialOwner` parameter

2. **AccessControl (Roles)**
   - Role-based permissions
   - `onlyRole(ROLE)` modifier
   - Role identifiers via `keccak256("ROLE_NAME")`
   - Constructor: `defaultAdmin` + role-specific addresses
   - `_grantRole()` in constructor

3. **AccessManaged**
   - External authority delegation
   - `restricted` modifier
   - Constructor: `initialAuthority` parameter

**When Access Control is Required**:
- Mintable tokens (mint function)
- Pausable contracts (pause/unpause)
- UUPS upgradeable (_authorizeUpgrade)

**Code References**:
- `packages/core/solidity/src/set-access-control.ts` - Full implementation
- `packages/core/solidity/src/erc20.ts:81-83` - Required conditions
- `packages/core/solidity/src/erc20.test.ts.md:95-136` - Example outputs

---

### 3.3 Solidity Upgradeability Skill (`references/upgradeability.md`)

**Topics to Cover**:

1. **Transparent Proxy**
   - Separate admin from contract logic
   - Adds `Initializable` parent only
   - No access control requirement
   - Higher gas overhead

2. **UUPS Proxy**
   - Upgrade logic in implementation contract
   - Adds `Initializable` + `UUPSUpgradeable`
   - REQUIRES access control for `_authorizeUpgrade()`
   - Lower gas overhead

3. **Namespaced Storage (ERC-7201)**
   - Required when: upgradeable + custom cross-chain bridging
   - Prevents storage collision
   - Uses `namespacePrefix` option

4. **Constructor to Initializer**
   - All upgradeable contracts convert `constructor()` to `initialize()`
   - Must call parent initializers

**Code References**:
- `packages/core/solidity/src/set-upgradeable.ts` - Implementation
- `packages/core/solidity/src/erc20.ts:207` - Namespace requirement logic

---

### 3.4 Cairo Component Skill (`references/components.md`)

**Topics to Cover**:

1. **Component Architecture**
   - Components vs Solidity inheritance
   - Substorage with `#[substorage(v0)]`
   - Event embedding with `#[flat]`
   - Implementation blocks (embedded vs internal)

2. **withComponents Macro**
   - `#[with_components(ERC20, Ownable)]` attribute
   - Cleaner code generation
   - Automatic component declarations

3. **Trait Implementations**
   - `ERC20HooksTrait` for transfer hooks
   - `#[generate_trait]` and `#[abi(per_item)]`
   - `#[external(v0)]` for ABI exposure

4. **SNIP-12 Metadata**
   - Required for Votes component
   - `appName` and `appVersion` parameters

**Code References**:
- `packages/core/cairo/src/erc20.ts:284-303` - Component definition
- `packages/core/cairo/src/print.ts:23-37` - withComponents directive
- `packages/core/cairo/src/set-macros.ts` - Macro configuration

---

### 3.5 Cairo Access Control Skill (`references/access-control.md`)

**Topics to Cover**:

1. **OwnableComponent**
   - `assert_only_owner()` assertion
   - Constructor: `owner` (ContractAddress)

2. **AccessControlComponent (Roles)**
   - `AccessControlImpl`, `AccessControlCamelImpl`
   - `selector!("ROLE_NAME")` for role identifiers
   - Constructor: `default_admin`

3. **DefaultAdminRules (DAR)**
   - Configurable admin transfer delays
   - `darInitialDelay`, `darDefaultDelayIncrease`, `darMaxTransferDelay`
   - Duration parsing ("1 day", "5 days")

**Code References**:
- `packages/core/cairo/src/set-access-control.ts:14-32` - DAR options
- `packages/core/cairo/src/tests/` - Snapshot examples

---

### 3.6 Stellar Token Skill (`references/tokens.md`)

**Topics to Cover**:

1. **Environment-Centric Architecture**
   - `&Env` as first parameter to every function
   - State via SDK functions, not instance variables
   - `Address`, `MuxedAddress`, `Symbol`, `i128` types

2. **Fungible Tokens**
   - Fixed 7 decimals (Stellar native)
   - `FungibleToken`, `FungibleBurnable` traits
   - Premint via constructor

3. **Non-Fungible Tokens**
   - NFT patterns for Soroban
   - Metadata handling

4. **Ledger-Based Time**
   - `u32 live_until_ledger` instead of timestamps
   - Affects approve() and timelock functions

**Code References**:
- `packages/core/stellar/src/fungible.ts:213` - Fixed 7 decimals
- `packages/core/stellar/src/contract.ts` - ContractBuilder patterns
- `packages/core/stellar/src/set-access-control.ts` - Trait implementations

---

### 3.7 Uniswap v4 Hooks Skill (`references/uniswap-hooks.md`)

**Topics to Cover**:

1. **Hook Types**
   - BaseHook, BaseAsyncSwap, BaseCustomAccounting
   - BaseCustomCurve, BaseDynamicFee, BaseOverrideFee
   - AntiSandwichHook, ReHypothecationHook, LimitOrderHook
   - Oracle hooks (BaseOracleHook, OracleHookWithV3Adapters)

2. **Permissions System**
   - beforeInitialize, afterInitialize
   - beforeSwap, afterSwap, beforeDonate, afterDonate
   - beforeAddLiquidity, beforeRemoveLiquidity
   - ReturnDelta variants

3. **Shares Types**
   - ERC20, ERC6909, ERC1155 shares
   - Required vs optional vs disabled per hook

4. **Input Validation**
   - maxAbsTickDelta (0-887272 for oracles)
   - blockNumberOffset (positive integer for penalty)

**Code References**:
- `packages/core/uniswap-hooks/src/hooks.ts:18-68` - Options interface
- `packages/core/uniswap-hooks/src/hooks.ts:143-164` - Shares configuration
- `packages/core/uniswap-hooks/src/hooks.ts:180-188` - Permission auto-enablement

---

## Part 4: Best Practices Determination Methodology

For each skill, best practices should be determined by examining:

### 4.1 Code Generation Logic

**What to Look For**:
- Option interfaces (`*Options` types)
- `withDefaults()` functions (default values)
- `isAccessControlRequired()` functions (forced requirements)
- `build*()` functions (composition order)
- Validation logic (incompatibility checks)

**Example Files**:
| Language | Files |
|----------|-------|
| Solidity | `packages/core/solidity/src/{erc20,erc721,erc1155,governor,account}.ts` |
| Cairo | `packages/core/cairo/src/{erc20,erc721,erc1155,governor,account,multisig,vesting}.ts` |
| Stellar | `packages/core/stellar/src/{fungible,non-fungible,stablecoin}.ts` |
| Stylus | `packages/core/stylus/src/{erc20,erc721,erc1155}.ts` |

### 4.2 Test Snapshots

**What They Provide**:
- Working examples of feature combinations
- Expected output for various configurations
- Edge cases and complex compositions

**Snapshot Locations**:
```
packages/core/solidity/src/*.test.ts.md
packages/core/cairo/src/tests/with_components_{on,off}/*/*.test.ts.md
packages/core/stellar/src/*.test.ts.md
packages/core/stylus/src/*.test.ts.md
packages/core/uniswap-hooks/src/*.test.ts.md
```

### 4.3 AI Descriptions (Existing)

**Location**: `packages/common/src/ai/descriptions/`

| File | Content |
|------|---------|
| `common.ts` | Shared descriptions (name, symbol, burnable, pausable, mintable) |
| `solidity.ts` | Contract type prompts and option descriptions |
| `cairo.ts` | Cairo-specific descriptions |
| `stellar.ts` | Stellar-specific descriptions |
| `stylus.ts` | Stylus-specific descriptions |
| `uniswap-hooks.ts` | Hook-specific descriptions |

### 4.4 Feature Module Files

**Access Control Patterns**:
```
packages/core/{solidity,cairo,stellar,stylus}/src/set-access-control.ts
```

**Upgradeability Patterns**:
```
packages/core/solidity/src/set-upgradeable.ts
packages/core/cairo/src/set-upgradeable.ts
packages/core/stellar/src/add-upgradeable.ts
```

**Pausable Patterns**:
```
packages/core/{solidity,cairo,stellar}/src/add-pausable.ts
```

### 4.5 Print Functions

**What They Show**:
- Final code output structure
- Import organization
- Inheritance/component ordering
- Override requirements

**Files**:
```
packages/core/{solidity,cairo,stellar,stylus,uniswap-hooks}/src/print.ts
```

---

## Part 5: Implementation Priority

### Phase 1: Foundation
1. Master routing skill (`openzeppelin-contracts`)
2. Solidity skill with tokens and access control references
3. Security checklist reference

### Phase 2: Solidity Complete
4. Solidity governance reference
5. Solidity upgradeability reference
6. Solidity accounts reference
7. Uniswap hooks reference

### Phase 3: Cairo
8. Cairo skill with components reference
9. Cairo tokens reference
10. Cairo access control and upgradeability

### Phase 4: Stellar & Stylus
11. Stellar skill with all references
12. Stylus skill with all references

### Phase 5: Advanced
13. Cross-language comparison references
14. Security deep-dive skill

---

## Part 6: Code References Index

### Feature Composition Logic
| Topic | Primary File | Key Lines |
|-------|--------------|-----------|
| ERC20 composition | `packages/core/solidity/src/erc20.ts` | 85-137 |
| ERC721 composition | `packages/core/solidity/src/erc721.ts` | buildERC721() |
| ERC1155 composition | `packages/core/solidity/src/erc1155.ts` | buildERC1155() |
| Governor composition | `packages/core/solidity/src/governor.ts` | buildGovernor() |
| Hook composition | `packages/core/uniswap-hooks/src/hooks.ts` | 112-202 |

### Validation & Incompatibilities
| Validation | File | Lines |
|------------|------|-------|
| Access control required | `packages/core/solidity/src/erc20.ts` | 81-83 |
| Votes requires Permit | `packages/core/solidity/src/erc20.ts` | 118-126, 278-280 |
| Cross-chain premint validation | `packages/core/solidity/src/erc20.ts` | 209-220 |
| Hook input validation | `packages/core/uniswap-hooks/src/hooks.ts` | 84-106 |

### Access Control Implementation
| Language | File |
|----------|------|
| Solidity | `packages/core/solidity/src/set-access-control.ts` |
| Cairo | `packages/core/cairo/src/set-access-control.ts` |
| Stellar | `packages/core/stellar/src/set-access-control.ts` |
| Stylus | `packages/core/stylus/src/set-access-control.ts` |

### Upgradeability Implementation
| Language | File |
|----------|------|
| Solidity | `packages/core/solidity/src/set-upgradeable.ts` |
| Cairo | `packages/core/cairo/src/set-upgradeable.ts` |
| Stellar | `packages/core/stellar/src/add-upgradeable.ts` |

### Pausable Implementation
| Language | File |
|----------|------|
| Solidity | `packages/core/solidity/src/add-pausable.ts` |
| Cairo | `packages/core/cairo/src/add-pausable.ts` |
| Stellar | `packages/core/stellar/src/add-pausable.ts` |

### Generated Output Examples
| Language | Snapshot Directory |
|----------|-------------------|
| Solidity | `packages/core/solidity/src/*.test.ts.md` |
| Cairo | `packages/core/cairo/src/tests/` |
| Stellar | `packages/core/stellar/src/*.test.ts.md` |
| Stylus | `packages/core/stylus/src/*.test.ts.md` |
| Uniswap Hooks | `packages/core/uniswap-hooks/src/*.test.ts.md` |

---

## Appendix A: Language Paradigm Comparison

| Aspect | Solidity | Cairo | Stellar | Stylus |
|--------|----------|-------|---------|--------|
| Code Reuse | Inheritance (`is`) | Components | Trait impls | Trait impls |
| Access Control | Modifiers | Code injection | Macros or calls | (Planned) |
| State Storage | Contract variables | Component substorage | SDK functions | Storage structs |
| Function Visibility | public/external/internal/private | #[external(v0)] | pub + traits | pub |
| Upgrade Pattern | UUPS/Transparent proxy | ClassHash upgrade | Macro-based | TBD |
| Access Options | Ownable, Roles, Managed | Ownable, Roles, DAR | Ownable, Roles | Ownable, Roles |

---

## Appendix B: Contract Type Matrix

| Contract Type | Solidity | Cairo | Stellar | Stylus | Uniswap |
|---------------|----------|-------|---------|--------|---------|
| ERC20/Fungible | ERC20 | ERC20 | Fungible | ERC20 | - |
| ERC721/NFT | ERC721 | ERC721 | Non-Fungible | ERC721 | - |
| ERC1155 | ERC1155 | ERC1155 | - | ERC1155 | - |
| Governor | Governor | Governor | - | - | - |
| Account (4337) | Account | Account | - | - | - |
| Stablecoin | Stablecoin | - | Stablecoin | - | - |
| Multisig | - | Multisig | - | - | - |
| Vesting | - | Vesting | - | - | - |
| Custom | Custom | Custom | - | - | - |
| Hooks | - | - | - | - | Hooks |
