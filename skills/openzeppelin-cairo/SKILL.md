---
name: openzeppelin-cairo
description: |
  Build secure Cairo smart contracts for Starknet using OpenZeppelin Contracts for Cairo. Use when users ask about: (1) Cairo/Starknet contracts, (2) ERC20/ERC721/ERC1155 tokens on Starknet, (3) Cairo components and composability, (4) Starknet access control (Ownable, Roles, DefaultAdminRules), (5) Upgradeable contracts via ClassHash, (6) Governor contracts on Starknet, (7) Multisig and vesting contracts, (8) SNIP-12 metadata for voting, (9) withComponents macro usage.
---

# OpenZeppelin Cairo Contracts

Build secure smart contracts for Starknet using Cairo.

## Installation

Add to `Scarb.toml`:

```toml
[dependencies]
openzeppelin = { git = "https://github.com/OpenZeppelin/cairo-contracts.git", tag = "v0.15.0" }
```

See [installation.md](references/installation.md) for detailed setup.

## Key Differences from Solidity

| Aspect | Solidity | Cairo |
|--------|----------|-------|
| Code Reuse | Inheritance (`is`) | Components |
| Storage | Contract variables | Component substorages |
| Function Access | Modifiers | Code injection/assertions |
| Events | Direct emit | Component event embedding |
| Upgrade | Proxy patterns | ClassHash upgrade |

## Contract Types

| Type | Description | Reference |
|------|-------------|-----------|
| ERC20 | Fungible tokens | [tokens.md](references/tokens.md) |
| ERC721 | Non-fungible tokens | [tokens.md](references/tokens.md) |
| ERC1155 | Multi-tokens | [tokens.md](references/tokens.md) |
| Governor | On-chain governance | [governance.md](references/governance.md) |
| Account | Starknet accounts | [governance.md](references/governance.md) |
| Multisig | Multi-signature | [governance.md](references/governance.md) |
| Vesting | Token vesting | [governance.md](references/governance.md) |

## Quick Start: ERC20 Token

```cairo
#[starknet::contract]
mod MyToken {
    use openzeppelin_token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use starknet::ContractAddress;

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);

    #[abi(embed_v0)]
    impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, recipient: ContractAddress, initial_supply: u256) {
        self.erc20.initializer("MyToken", "MTK");
        self.erc20.mint(recipient, initial_supply);
    }
}
```

## Component System

Cairo uses components instead of inheritance:

```cairo
// 1. Declare component
component!(path: ERC20Component, storage: erc20, event: ERC20Event);

// 2. Embed implementation (public functions)
#[abi(embed_v0)]
impl ERC20Impl = ERC20Component::ERC20Impl<ContractState>;

// 3. Internal implementation (private)
impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;

// 4. Add substorage
#[storage]
struct Storage {
    #[substorage(v0)]
    erc20: ERC20Component::Storage,
}

// 5. Add events
#[event]
enum Event {
    #[flat]
    ERC20Event: ERC20Component::Event,
}
```

See [components.md](references/components.md) for detailed explanation.

## withComponents Macro

Cleaner syntax with `#[with_components]`:

```cairo
#[starknet::contract]
#[with_components(ERC20, Ownable)]
mod MyToken {
    // Components declared automatically
    // Storage and events generated
}
```

See [components.md](references/components.md) for usage.

## Reference Files

| Topic | File |
|-------|------|
| Installation & Setup | [installation.md](references/installation.md) |
| Component System | [components.md](references/components.md) |
| ERC20, ERC721, ERC1155 | [tokens.md](references/tokens.md) |
| Ownable, Roles, DAR | [access-control.md](references/access-control.md) |
| ClassHash Upgrades | [upgradeability.md](references/upgradeability.md) |
| Governor, Multisig, Vesting | [governance.md](references/governance.md) |

## Access Control

Three patterns available:

| Pattern | Guard | Use Case |
|---------|-------|----------|
| Ownable | `assert_only_owner()` | Single admin |
| Roles | `assert_only_role(ROLE)` | Multiple roles |
| DAR | Roles + time delays | Secure admin transfer |

## Feature Dependencies

```
Votes ──requires──> SNIP-12 Metadata (appName, appVersion)
Upgradeable ──requires──> Access Control
Pausable ──requires──> Access Control
```
