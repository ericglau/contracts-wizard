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
openzeppelin-stylus = "^0.3.0"
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
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
extern crate alloc;

use alloc::vec::Vec;
use openzeppelin_stylus::token::erc20::{self, Erc20, IErc20};
use stylus_sdk::alloy_primitives::{Address, U256};
use stylus_sdk::prelude::*;

#[entrypoint]
#[storage]
struct MyToken {
    erc20: Erc20,
}

#[public]
#[implements(IErc20<Error = erc20::Error>)]
impl MyToken {}
```

## Storage Pattern

Stylus uses `#[storage]` for state:

```rust
#[entrypoint]
#[storage]
struct MyToken {
    erc20: Erc20,
    ownable: Ownable,
}
```

## Trait-Based Pattern

Contracts implement traits from the SDK:

```rust
#[public]
#[implements(IErc20<Error = erc20::Error>)]
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
