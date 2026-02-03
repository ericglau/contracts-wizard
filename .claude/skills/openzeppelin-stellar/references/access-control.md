# Stellar Access Control

## Table of Contents

1. [Overview](#overview)
2. [Ownable](#ownable)
3. [AccessControl (Roles)](#accesscontrol-roles)
4. [Pausable](#pausable)

---

## Overview

Two access control patterns available:

| Pattern | Use Case | Complexity |
|---------|----------|------------|
| Ownable | Single admin | Low |
| AccessControl | Multiple roles | Medium |

---

## Ownable

Single account controls privileged functions.

### Basic Usage

```rust
use openzeppelin_stellar_contracts::access::ownable;
use stellar_macros::only_owner;

#[contract]
pub struct MyContract;

#[contractimpl]
impl MyContract {
    pub fn __constructor(e: &Env, owner: Address) {
        ownable::set_owner(e, &owner);
    }

    #[only_owner]
    pub fn privileged_action(e: &Env) {
        // Only owner can call this
    }
}
```

### Without Macro (Explicit)

```rust
#[contractimpl]
impl MyContract {
    pub fn __constructor(e: &Env, owner: Address) {
        ownable::set_owner(e, &owner);
    }

    pub fn privileged_action(e: &Env) {
        // Explicit owner check
        ownable::enforce_owner_auth(e);
        // Privileged logic
    }
}
```

### Key Functions

```rust
// Set owner (typically in constructor)
ownable::set_owner(e, &owner);

// Get current owner
let owner: Address = ownable::owner(e);

// Transfer ownership
ownable::transfer_ownership(e, &new_owner);

// Enforce caller is owner
ownable::enforce_owner_auth(e);
```

### Ownable Trait Implementation

```rust
use openzeppelin_stellar_contracts::access::ownable::{Ownable, ownable};

#[contractimpl]
impl Ownable for MyContract {
    fn owner(e: &Env) -> Address {
        ownable::owner(e)
    }

    fn transfer_ownership(e: &Env, new_owner: &Address) {
        ownable::enforce_owner_auth(e);
        ownable::transfer_ownership(e, new_owner);
    }
}
```

---

## AccessControl (Roles)

Multiple roles with granular permissions.

### Basic Usage

```rust
use openzeppelin_stellar_contracts::access::access_control;
use soroban_sdk::Symbol;
use stellar_macros::only_role;

#[contract]
pub struct MyContract;

#[contractimpl]
impl MyContract {
    pub fn __constructor(e: &Env, admin: Address, minter: Address) {
        // Set admin
        access_control::set_admin(e, &admin);

        // Grant roles
        let minter_role = Symbol::new(e, "MINTER_ROLE");
        access_control::grant_role(e, &minter_role, &minter);
    }

    #[only_role(caller, "MINTER_ROLE")]
    pub fn mint(e: &Env, caller: &Address, to: &Address, amount: i128) {
        // Only MINTER_ROLE can call this
        Base::mint(e, to, amount);
    }
}
```

### Without Macro (Explicit)

```rust
#[contractimpl]
impl MyContract {
    pub fn mint(e: &Env, caller: &Address, to: &Address, amount: i128) {
        // Explicit role check
        let minter_role = Symbol::new(e, "MINTER_ROLE");
        access_control::enforce_role(e, caller, &minter_role);

        Base::mint(e, to, amount);
    }
}
```

### Key Functions

```rust
// Admin management
access_control::set_admin(e, &admin);
access_control::admin(e) -> Address;
access_control::transfer_admin_role(e, &new_admin);
access_control::accept_admin_transfer(e, &new_admin);

// Role management
access_control::grant_role(e, &role, &account);
access_control::revoke_role(e, &role, &account);
access_control::renounce_role(e, &role, &account);

// Role queries
access_control::has_role(e, &account, &role) -> Option<u32>;
access_control::get_existing_roles(e) -> Vec<Symbol>;

// Enforcement
access_control::enforce_role(e, &account, &role);
```

### Role Definition

Roles are `Symbol` values:

```rust
// Short symbols (up to 9 chars) - more efficient
let minter_role = Symbol::short("MINTER");
let pauser_role = Symbol::short("PAUSER");

// Long symbols
let minter_role = Symbol::new(e, "MINTER_ROLE");
let pauser_role = Symbol::new(e, "PAUSER_ROLE");
```

### AccessControl Trait Implementation

```rust
use openzeppelin_stellar_contracts::access::access_control::{AccessControl, access_control};

#[contractimpl]
impl AccessControl for MyContract {
    fn has_role(e: &Env, account: &Address, role: Symbol) -> Option<u32> {
        access_control::has_role(e, account, &role)
    }

    fn get_existing_roles(e: &Env) -> Vec<Symbol> {
        access_control::get_existing_roles(e)
    }

    fn grant_role(e: &Env, role: Symbol, account: &Address) {
        access_control::enforce_admin_auth(e);
        access_control::grant_role(e, &role, account);
    }

    fn revoke_role(e: &Env, role: Symbol, account: &Address) {
        access_control::enforce_admin_auth(e);
        access_control::revoke_role(e, &role, account);
    }

    fn renounce_role(e: &Env, role: Symbol, account: &Address) {
        account.require_auth();
        access_control::renounce_role(e, &role, account);
    }

    fn transfer_admin_role(e: &Env, new_admin: &Address) {
        access_control::enforce_admin_auth(e);
        access_control::transfer_admin_role(e, new_admin);
    }

    fn accept_admin_transfer(e: &Env, new_admin: &Address) {
        new_admin.require_auth();
        access_control::accept_admin_transfer(e, new_admin);
    }
}
```

---

## Pausable

Emergency pause functionality.

### Basic Usage

```rust
use openzeppelin_stellar_contracts::security::pausable;
use stellar_macros::{only_owner, when_not_paused};

#[contract]
pub struct MyContract;

#[contractimpl]
impl MyContract {
    #[when_not_paused]
    pub fn transfer(e: &Env, from: &Address, to: &Address, amount: i128) {
        // This function is blocked when paused
    }

    #[only_owner]
    pub fn pause(e: &Env) {
        pausable::pause(e);
    }

    #[only_owner]
    pub fn unpause(e: &Env) {
        pausable::unpause(e);
    }
}
```

### Without Macro (Explicit)

```rust
#[contractimpl]
impl MyContract {
    pub fn transfer(e: &Env, from: &Address, to: &Address, amount: i128) {
        // Explicit pause check
        pausable::enforce_not_paused(e);
        // Transfer logic
    }
}
```

### Key Functions

```rust
// Pause/unpause
pausable::pause(e);
pausable::unpause(e);

// Check state
pausable::is_paused(e) -> bool;

// Enforcement
pausable::enforce_not_paused(e);
pausable::enforce_paused(e);
```

---

## Combining Access Patterns

### Full Example

```rust
use openzeppelin_stellar_contracts::access::{ownable, access_control};
use openzeppelin_stellar_contracts::security::pausable;
use stellar_macros::{only_owner, only_role, when_not_paused};

#[contract]
pub struct MyToken;

#[contractimpl]
impl MyToken {
    pub fn __constructor(e: &Env, owner: Address, minter: Address, pauser: Address) {
        ownable::set_owner(e, &owner);

        let minter_role = Symbol::short("MINTER");
        let pauser_role = Symbol::short("PAUSER");

        access_control::set_admin(e, &owner);
        access_control::grant_role(e, &minter_role, &minter);
        access_control::grant_role(e, &pauser_role, &pauser);
    }

    #[when_not_paused]
    pub fn transfer(e: &Env, from: &Address, to: &Address, amount: i128) {
        from.require_auth();
        Base::transfer(e, from, to, amount);
    }

    #[only_role(caller, "MINTER")]
    pub fn mint(e: &Env, caller: &Address, to: &Address, amount: i128) {
        Base::mint(e, to, amount);
    }

    #[only_role(caller, "PAUSER")]
    pub fn pause(e: &Env, caller: &Address) {
        pausable::pause(e);
    }

    #[only_role(caller, "PAUSER")]
    pub fn unpause(e: &Env, caller: &Address) {
        pausable::unpause(e);
    }

    #[only_owner]
    pub fn upgrade(e: &Env, new_wasm_hash: BytesN<32>) {
        // Owner-only upgrade
    }
}
```
