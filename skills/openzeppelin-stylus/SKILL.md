---
name: openzeppelin-stylus
description: |
  Build secure Rust smart contracts for Arbitrum Stylus using OpenZeppelin Contracts for Stylus. Use when users ask about: (1) Arbitrum Stylus contracts, (2) Rust EVM contracts, (3) ERC20 tokens on Stylus, (4) ERC721 NFTs on Stylus, (5) ERC1155 multi-tokens on Stylus, (6) Access control on Stylus (Ownable, Roles), (7) Stylus SDK patterns, (8) Rust smart contracts for EVM.
---

# OpenZeppelin Stylus Contracts

Build secure smart contracts for Arbitrum Stylus using Rust.

## Installation

Add to `Cargo.toml`:

```toml
[dependencies]
stylus-sdk = "0.6.0"
openzeppelin-stylus = { git = "https://github.com/OpenZeppelin/rust-contracts-for-stylus.git" }
alloy-primitives = "0.7.0"
```

See [installation.md](references/installation.md) for detailed setup.

## Key Differences from Solidity

| Aspect | Solidity | Stylus |
|--------|----------|--------|
| Language | Solidity | Rust |
| State | Contract variables | Storage structs |
| Functions | Methods | Trait implementations |
| Types | uint256, address | U256, Address |
| Errors | Custom errors/require | Result types |

## Contract Types

| Type | Description | Reference |
|------|-------------|-----------|
| ERC20 | Fungible tokens | [tokens.md](references/tokens.md) |
| ERC721 | Non-fungible tokens | [tokens.md](references/tokens.md) |
| ERC1155 | Multi-tokens | [tokens.md](references/tokens.md) |

## Quick Start: ERC20 Token

```rust
#![cfg_attr(not(any(test, feature = "std")), no_std)]
extern crate alloc;

use alloc::vec::Vec;
use stylus_sdk::prelude::*;
use openzeppelin_stylus::token::erc20::{Erc20, IErc20};

sol_storage! {
    #[entrypoint]
    pub struct MyToken {
        #[borrow]
        Erc20 erc20;
    }
}

#[public]
#[inherit(Erc20)]
impl MyToken {
    // Custom functions here
}
```

## Storage Pattern

Stylus uses `sol_storage!` macro for state:

```rust
sol_storage! {
    #[entrypoint]
    pub struct MyToken {
        #[borrow]
        Erc20 erc20;
        #[borrow]
        Ownable ownable;
        // Custom storage
        uint256 custom_value;
    }
}
```

## Trait-Based Pattern

Contracts implement traits from the SDK:

```rust
// Inherit all ERC20 functions
#[public]
#[inherit(Erc20)]
impl MyToken {}

// Or implement specific interface
#[public]
impl IErc20 for MyToken {
    fn total_supply(&self) -> U256 {
        self.erc20.total_supply()
    }
    // ... other methods
}
```

## Reference Files

| Topic | File |
|-------|------|
| Installation & Setup | [installation.md](references/installation.md) |
| ERC20, ERC721, ERC1155 | [tokens.md](references/tokens.md) |
| Ownable, AccessControl | [access-control.md](references/access-control.md) |

## Type Mappings

| Solidity | Stylus |
|----------|--------|
| `uint256` | `U256` |
| `int256` | `I256` |
| `address` | `Address` |
| `bytes32` | `B256` |
| `bytes` | `Bytes` |
| `string` | `String` |
| `bool` | `bool` |

## Error Handling

Stylus uses Rust's Result type:

```rust
pub fn transfer(&mut self, to: Address, value: U256) -> Result<bool, Self::Error> {
    self.erc20.transfer(to, value)?;
    Ok(true)
}
```
