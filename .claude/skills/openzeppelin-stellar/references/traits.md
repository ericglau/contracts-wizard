# Stellar Trait System

## Table of Contents

1. [Overview](#overview)
2. [Trait Implementation](#trait-implementation)
3. [Contract Attributes](#contract-attributes)
4. [Macros](#macros)
5. [Environment Pattern](#environment-pattern)

---

## Overview

Stellar contracts use Rust traits instead of inheritance:

| Solidity | Stellar |
|----------|---------|
| `contract A is B` | `impl B for A` |
| Override function | Implement trait method |
| Modifier | Macro attribute or function call |

---

## Trait Implementation

### Empty Implementation (Use Defaults)

```rust
#[contract]
pub struct MyToken;

// Use all default implementations
#[contractimpl]
impl FungibleToken for MyToken {}
```

### Partial Override

```rust
#[contractimpl]
impl FungibleToken for MyToken {
    // Override specific method
    fn balance(e: &Env, account: &Address) -> i128 {
        // Custom logic
        Base::balance(e, account)
    }

    // Other methods use defaults
}
```

### Full Custom Implementation

```rust
#[contractimpl]
impl FungibleToken for MyToken {
    fn total_supply(e: &Env) -> i128 {
        // Custom implementation
    }

    fn balance(e: &Env, account: &Address) -> i128 {
        // Custom implementation
    }

    fn transfer(e: &Env, from: &Address, to: &Address, amount: i128) {
        // Custom implementation
    }

    // ... all methods
}
```

---

## Contract Attributes

### Basic Contract

```rust
#[contract]
pub struct MyContract;

#[contractimpl]
impl MyContract {
    pub fn my_function(e: &Env) {
        // Function logic
    }
}
```

### Multiple Impl Blocks

```rust
#[contract]
pub struct MyToken;

// Trait implementation
#[contractimpl]
impl FungibleToken for MyToken {}

// Custom functions
#[contractimpl]
impl MyToken {
    pub fn __constructor(e: &Env, admin: Address) {
        // Initialization
    }

    pub fn mint(e: &Env, to: &Address, amount: i128) {
        // Mint logic
    }
}
```

### Contract Trait Mode

Two modes for trait implementation:

```rust
// Implicit (generates stub methods)
#[contractimpl(contracttrait)]
impl FungibleToken for MyToken {}

// Explicit (you define all methods)
#[contractimpl]
impl FungibleToken for MyToken {
    // Must implement all trait methods
}
```

---

## Macros

### Access Control Macros

```rust
use stellar_macros::{only_owner, only_admin, only_role, when_not_paused};

#[contractimpl]
impl MyToken {
    #[only_owner]
    pub fn mint(e: &Env, to: &Address, amount: i128) {
        Base::mint(e, to, amount);
    }

    #[only_role(caller, "MINTER_ROLE")]
    pub fn mint_with_role(e: &Env, caller: &Address, to: &Address, amount: i128) {
        Base::mint(e, to, amount);
    }

    #[when_not_paused]
    pub fn transfer(e: &Env, from: &Address, to: &Address, amount: i128) {
        Base::transfer(e, from, to, amount);
    }
}
```

### Derive Macros

```rust
use stellar_macros::Upgradeable;

#[derive(Upgradeable)]
#[contract]
pub struct MyToken;
```

### Without Macros (Explicit)

```rust
#[contractimpl]
impl MyToken {
    pub fn mint(e: &Env, to: &Address, amount: i128) {
        // Explicit access check
        ownable::enforce_owner_auth(e);
        Base::mint(e, to, amount);
    }

    pub fn transfer(e: &Env, from: &Address, to: &Address, amount: i128) {
        // Explicit pause check
        if pausable::paused(e) {
            panic!("paused");
        }
        Base::transfer(e, from, to, amount);
    }
}
```

---

## Environment Pattern

### The `&Env` Parameter

Every function requires `&Env` as first parameter:

```rust
pub fn my_function(e: &Env, other_param: i128) {
    // e provides:
    // - Storage access
    // - Authentication
    // - Event emission
    // - Crypto operations
    // - Contract calls
}
```

### What Env Provides

```rust
pub fn example(e: &Env) {
    // Storage
    e.storage().instance().set(&key, &value);
    let val: i128 = e.storage().instance().get(&key).unwrap();

    // Authentication
    address.require_auth();
    address.require_auth_for_args(args);

    // Events
    e.events().publish(topics, data);

    // Current ledger
    let ledger = e.ledger().sequence();
    let timestamp = e.ledger().timestamp();

    // Crypto
    let hash = e.crypto().sha256(&bytes);

    // Contract calls
    let client = OtherContractClient::new(e, &contract_id);
}
```

### Address Authentication

```rust
pub fn transfer(e: &Env, from: &Address, to: &Address, amount: i128) {
    // Require 'from' to authorize this call
    from.require_auth();

    // Proceed with transfer
    Base::transfer(e, from, to, amount);
}
```

---

## Type System

### Common Types

```rust
use soroban_sdk::{
    Address,       // Account or contract address
    MuxedAddress,  // Multiplexed address
    String,        // Contract string
    Symbol,        // Interned string for efficiency
    BytesN,        // Fixed-size bytes
    Vec,           // Dynamic array
    Map,           // Key-value map
};
```

### Numeric Types

```rust
i128   // Token amounts (can be negative for deltas)
u128   // Unsigned amounts
i64    // Timestamps, durations
u64    // Unsigned integers
u32    // Ledger numbers
```

### Creating Strings

```rust
// From literal
let name = String::from_str(e, "MyToken");

// Symbol for efficiency
let role = Symbol::new(e, "MINTER_ROLE");
```

### Option Handling

```rust
// Storage returns Option
let balance: Option<i128> = e.storage().instance().get(&key);
let balance = balance.unwrap_or(0);
```

---

## Error Handling

### Custom Errors

```rust
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    InsufficientBalance = 1,
    InvalidAmount = 2,
    Unauthorized = 3,
}
```

### Using Errors

```rust
pub fn transfer(e: &Env, from: &Address, to: &Address, amount: i128) -> Result<(), Error> {
    if amount <= 0 {
        return Err(Error::InvalidAmount);
    }

    let balance = Base::balance(e, from);
    if balance < amount {
        return Err(Error::InsufficientBalance);
    }

    // Transfer logic
    Ok(())
}
```

### Panic vs Result

```rust
// Panic - simpler but less informative
pub fn mint(e: &Env, to: &Address, amount: i128) {
    assert!(amount > 0, "Invalid amount");
    Base::mint(e, to, amount);
}

// Result - better error handling
pub fn mint(e: &Env, to: &Address, amount: i128) -> Result<(), Error> {
    if amount <= 0 {
        return Err(Error::InvalidAmount);
    }
    Base::mint(e, to, amount);
    Ok(())
}
```
