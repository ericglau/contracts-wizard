---
name: openzeppelin-stellar
description: |
  Build secure Rust smart contracts for Stellar/Soroban using OpenZeppelin Contracts for Stellar. Use when users ask about: (1) Stellar/Soroban contracts, (2) Fungible tokens on Stellar, (3) Non-fungible tokens (NFTs) on Stellar, (4) Stablecoin tokens on Stellar, (5) Rust trait-based contract patterns, (6) Access control on Stellar (Ownable, AccessControl), (7) Upgradeable contracts with macros, (8) Soroban SDK patterns.
---

# OpenZeppelin Stellar Contracts

Build secure smart contracts for Stellar/Soroban using Rust.

## Installation

Add to `Cargo.toml`:

```toml
[dependencies]
soroban-sdk = "23.4.0"
stellar-tokens = "=0.6.0"
stellar-access = "=0.6.0"
stellar-contract-utils = "=0.6.0"
stellar-macros = "=0.6.0"
```

See [installation.md](references/installation.md) for detailed setup.

## Key Differences from Solidity/Cairo

| Aspect | Solidity | Stellar |
|--------|----------|---------|
| Language | Solidity | Rust |
| State | Contract variables | SDK functions |
| Functions | Methods | Trait implementations |
| First param | (implicit) | `&Env` always |
| Decimals | Configurable | Fixed 7 |
| Time | block.timestamp | Ledger number |

## Contract Types

| Type | Description | Reference |
|------|-------------|-----------|
| Fungible | Fungible tokens | [tokens.md](references/tokens.md) |
| Non-Fungible | NFTs | [tokens.md](references/tokens.md) |
| Stablecoin | Regulated tokens | [tokens.md](references/tokens.md) |

## Quick Start: Fungible Token

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String};
use stellar_tokens::fungible::{Base, FungibleToken};

#[contract]
pub struct MyToken;

#[contractimpl]
impl MyToken {
    pub fn __constructor(e: &Env) {
        Base::set_metadata(e, 7, String::from_str(e, "MyToken"), String::from_str(e, "MTK"));
    }
}

#[contractimpl(contracttrait)]
impl FungibleToken for MyToken {
    type ContractType = Base;
}
```

## Environment Pattern

Every function requires `&Env` as first parameter:

```rust
pub fn transfer(e: &Env, from: &Address, to: &Address, amount: i128) {
    // e provides access to storage, auth, events, etc.
}
```

## Trait-Based Pattern

Contracts implement traits from the SDK:

```rust
// Empty implementation uses defaults
#[contractimpl]
impl FungibleToken for MyToken {}

// Or override specific methods
#[contractimpl]
impl FungibleToken for MyToken {
    fn balance(e: &Env, account: &Address) -> i128 {
        // Custom logic
    }
}
```

## Reference Files

| Topic | File |
|-------|------|
| Installation & Setup | [installation.md](references/installation.md) |
| Trait System | [traits.md](references/traits.md) |
| Fungible, NFT, Stablecoin | [tokens.md](references/tokens.md) |
| Ownable, AccessControl | [access-control.md](references/access-control.md) |

## Important Notes

### Fixed Decimals

Stellar tokens always have **7 decimals**:

```rust
Base::set_metadata(e, 7, name, symbol);  // Always 7
```

### Ledger-Based Time

Use ledger numbers instead of timestamps:

```rust
// Approve with expiration
pub fn approve(e: &Env, spender: &Address, amount: i128, live_until_ledger: u32) {
    // live_until_ledger is a ledger sequence number
}
```

### Address Types

Stellar has multiple address types:

```rust
use soroban_sdk::{Address, MuxedAddress};

// Address - standard account
// MuxedAddress - multiplexed address for transfers
```
