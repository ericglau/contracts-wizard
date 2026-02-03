# Stylus Installation Guide

## Prerequisites

- Rust toolchain (stable)
- Cargo Stylus CLI
- wasm32 target: `rustup target add wasm32-unknown-unknown`

## Installing Cargo Stylus

```bash
cargo install cargo-stylus
```

## Package Installation

### Cargo.toml

```toml
[package]
name = "my_token"
version = "0.1.0"
edition = "2021"

[dependencies]
stylus-sdk = "0.6.0"
stylus-proc = "0.6.0"
openzeppelin-stylus = { git = "https://github.com/OpenZeppelin/rust-contracts-for-stylus.git" }
alloy-primitives = "0.7.0"
alloy-sol-types = "0.7.0"

[features]
default = []
std = []
export-abi = ["std", "stylus-sdk/export-abi"]

[lib]
crate-type = ["lib", "cdylib"]

[profile.release]
codegen-units = 1
strip = true
lto = true
panic = "abort"
opt-level = "s"
```

## Import Patterns

### Token Modules

```rust
// ERC20
use openzeppelin_stylus::token::erc20::{Erc20, IErc20};
use openzeppelin_stylus::token::erc20::extensions::permit::{Erc20Permit, IErc20Permit};
use openzeppelin_stylus::token::erc20::extensions::burnable::IErc20Burnable;
use openzeppelin_stylus::token::erc20::extensions::flash_mint::{Erc20FlashMint, IErc3156FlashLender};

// ERC721
use openzeppelin_stylus::token::erc721::{Erc721, IErc721};
use openzeppelin_stylus::token::erc721::extensions::burnable::IErc721Burnable;

// ERC1155
use openzeppelin_stylus::token::erc1155::{Erc1155, IErc1155};
```

### Access Control

```rust
// Ownable
use openzeppelin_stylus::access::ownable::{Ownable, IOwnable};

// AccessControl
use openzeppelin_stylus::access::control::{AccessControl, IAccessControl};
```

### Utilities

```rust
// Nonces (for permit)
use openzeppelin_stylus::utils::nonces::{Nonces, INonces};

// Cryptography
use openzeppelin_stylus::utils::cryptography::eip712::Eip712;
use openzeppelin_stylus::utils::cryptography::ecdsa;
```

### SDK Types

```rust
use stylus_sdk::{
    prelude::*,
    alloy_primitives::{Address, U256, B256, I256},
    msg,
    block,
};
use alloc::vec::Vec;
use alloc::string::String;
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
#![cfg_attr(not(any(test, feature = "std")), no_std)]
extern crate alloc;

use stylus_sdk::prelude::*;

sol_storage! {
    #[entrypoint]
    pub struct MyContract {
        // Storage fields
    }
}

#[public]
impl MyContract {
    pub fn my_function(&self) -> U256 {
        U256::ZERO
    }
}
```

## Building

```bash
# Check contract
cargo stylus check

# Build for deployment
cargo build --release --target wasm32-unknown-unknown

# Export ABI
cargo run --features export-abi
```

## Testing

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_example() {
        // Test logic
    }
}
```

Run tests:
```bash
cargo test
```

## Deployment

```bash
# Deploy to Arbitrum Sepolia
cargo stylus deploy \
    --private-key <KEY> \
    --endpoint https://sepolia-rollup.arbitrum.io/rpc
```

## Common Issues

### No Std Environment

Stylus contracts run in no_std:
```rust
#![cfg_attr(not(any(test, feature = "std")), no_std)]
extern crate alloc;  // For Vec, String, etc.
```

### ABI Export

To generate ABI:
```bash
cargo run --features export-abi > abi.json
```

### WASM Size

Keep WASM small with release profile:
```toml
[profile.release]
opt-level = "s"  # Optimize for size
lto = true
strip = true
```
