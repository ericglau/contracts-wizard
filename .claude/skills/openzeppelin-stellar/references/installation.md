# Stellar Installation Guide

## Prerequisites

- Rust toolchain (stable)
- Soroban CLI
- wasm32 target: `rustup target add wasm32-unknown-unknown`

## Package Installation

### Cargo.toml

```toml
[package]
name = "my_token"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]
doctest = false

[dependencies]
soroban-sdk = "21.0.0"
openzeppelin-stellar-contracts = { git = "https://github.com/OpenZeppelin/rust-contracts-for-stellar.git" }

[dev-dependencies]
soroban-sdk = { version = "21.0.0", features = ["testutils"] }

[profile.release]
opt-level = "z"
overflow-checks = true
debug = 0
strip = "symbols"
debug-assertions = false
panic = "abort"
codegen-units = 1
lto = true

[profile.release-with-logs]
inherits = "release"
debug-assertions = true
```

## Import Patterns

### Token Modules

```rust
// Fungible token (like ERC20)
use openzeppelin_stellar_contracts::token::fungible::{
    FungibleToken,
    FungibleBurnable,
    Base,
};

// Non-fungible token (like ERC721)
use openzeppelin_stellar_contracts::token::non_fungible::{
    NonFungibleToken,
    NonFungibleBurnable,
    Base as NFTBase,
};
```

### Access Control

```rust
// Ownable
use openzeppelin_stellar_contracts::access::ownable;

// AccessControl (Roles)
use openzeppelin_stellar_contracts::access::access_control;
```

### Utilities

```rust
// Pausable
use openzeppelin_stellar_contracts::security::pausable;

// Upgradeable
use openzeppelin_stellar_contracts::upgradeable::Upgradeable;
use stellar_macros::Upgradeable;
```

### SDK Types

```rust
use soroban_sdk::{
    contract,
    contractimpl,
    contracttype,
    contracterror,
    Address,
    Env,
    String,
    Symbol,
    Vec,
    BytesN,
};
```

## Project Structure

```
my_project/
├── Cargo.toml
├── src/
│   └── lib.rs
└── tests/
    └── test.rs
```

### Basic lib.rs

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, Env};

#[contract]
pub struct MyContract;

#[contractimpl]
impl MyContract {
    pub fn __constructor(e: &Env) {
        // Initialization
    }
}
```

## Building

```bash
# Build for deployment
soroban contract build

# Or with cargo
cargo build --target wasm32-unknown-unknown --release
```

## Testing

```rust
#![cfg(test)]
use soroban_sdk::{testutils::Address as _, Address, Env};
use crate::{MyContract, MyContractClient};

#[test]
fn test_example() {
    let env = Env::default();
    let contract_id = env.register_contract(None, MyContract);
    let client = MyContractClient::new(&env, &contract_id);

    // Test logic
}
```

Run tests:
```bash
cargo test
```

## Deployment

```bash
# Deploy to testnet
soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/my_contract.wasm \
    --network testnet \
    --source alice
```

## Common Issues

### No Std Environment

Stellar contracts run in no_std:
```rust
#![no_std]  // Required at top of lib.rs
```

### WASM Target

Ensure target is installed:
```bash
rustup target add wasm32-unknown-unknown
```

### SDK Version Mismatch

Keep SDK versions aligned:
```toml
[dependencies]
soroban-sdk = "21.0.0"

[dev-dependencies]
soroban-sdk = { version = "21.0.0", features = ["testutils"] }
```
