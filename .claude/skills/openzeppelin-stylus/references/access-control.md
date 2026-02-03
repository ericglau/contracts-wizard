# Stylus Access Control

## Table of Contents

1. [Overview](#overview)
2. [Ownable](#ownable)
3. [AccessControl (Roles)](#accesscontrol-roles)

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
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
extern crate alloc;

use alloc::vec::Vec;
use stylus_sdk::prelude::*;
use stylus_sdk::alloy_primitives::Address;
use openzeppelin_stylus::access::ownable::{Ownable, IOwnable};

#[entrypoint]
#[storage]
struct MyContract {
    ownable: Ownable,
}

#[public]
impl MyContract {
    pub fn privileged_action(&mut self) -> Result<(), Self::Error> {
        self.ownable.only_owner()?;
        // Privileged logic here
        Ok(())
    }
}
```

### Key Functions

```rust
// Query owner
fn owner(&self) -> Address;

// Transfer ownership
fn transfer_ownership(&mut self, new_owner: Address) -> Result<(), Error>;

// Renounce ownership (permanent)
fn renounce_ownership(&mut self) -> Result<(), Error>;

// Check caller is owner (reverts if not)
fn only_owner(&self) -> Result<(), Error>;
```

### Ownable with Token

```rust
use openzeppelin_stylus::token::erc20::{Erc20, IErc20};
use openzeppelin_stylus::access::ownable::{Ownable, IOwnable};

#[entrypoint]
#[storage]
struct MyToken {
    erc20: Erc20,
    ownable: Ownable,
}

#[public]
impl MyToken {
    pub fn mint(&mut self, to: Address, amount: U256) -> Result<(), Self::Error> {
        self.ownable.only_owner()?;
        self.erc20._mint(to, amount)?;
        Ok(())
    }
}
```

---

## AccessControl (Roles)

Multiple roles with granular permissions.

### Basic Usage

```rust
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
extern crate alloc;

use alloc::vec::Vec;
use stylus_sdk::prelude::*;
use stylus_sdk::alloy_primitives::{Address, U256, B256};
use openzeppelin_stylus::access::control::{AccessControl, IAccessControl};

// Define roles
const MINTER_ROLE: B256 = B256::ZERO; // keccak256("MINTER_ROLE") in practice
const PAUSER_ROLE: B256 = B256::ZERO; // keccak256("PAUSER_ROLE") in practice

#[entrypoint]
#[storage]
struct MyContract {
    access_control: AccessControl,
}

#[public]
impl MyContract {
    pub fn mint(&mut self, to: Address, amount: U256) -> Result<(), Self::Error> {
        self.access_control.only_role(MINTER_ROLE)?;
        // Mint logic
        Ok(())
    }

    pub fn pause(&mut self) -> Result<(), Self::Error> {
        self.access_control.only_role(PAUSER_ROLE)?;
        // Pause logic
        Ok(())
    }
}
```

### Role Definition

Roles are `B256` values (bytes32), typically keccak256 hashes:

```rust
use stylus_sdk::alloy_primitives::keccak256;

// Compute role hash
fn minter_role() -> B256 {
    keccak256("MINTER_ROLE")
}

fn pauser_role() -> B256 {
    keccak256("PAUSER_ROLE")
}

// Or use constants
const DEFAULT_ADMIN_ROLE: B256 = B256::ZERO;
```

### Key Functions

```rust
// Check role
fn has_role(&self, role: B256, account: Address) -> bool;

// Grant role (admin only)
fn grant_role(&mut self, role: B256, account: Address) -> Result<(), Error>;

// Revoke role (admin only)
fn revoke_role(&mut self, role: B256, account: Address) -> Result<(), Error>;

// Self-remove from role
fn renounce_role(&mut self, role: B256, caller_confirmation: Address) -> Result<(), Error>;

// Get admin role for a role
fn get_role_admin(&self, role: B256) -> B256;

// Check caller has role (reverts if not)
fn only_role(&self, role: B256) -> Result<(), Error>;
```

### Setting Up Roles

```rust
#[public]
impl MyContract {
    pub fn initialize(&mut self, admin: Address, minter: Address, pauser: Address) -> Result<(), Self::Error> {
        // Grant admin role
        self.access_control._grant_role(DEFAULT_ADMIN_ROLE, admin)?;

        // Grant specific roles
        self.access_control._grant_role(MINTER_ROLE, minter)?;
        self.access_control._grant_role(PAUSER_ROLE, pauser)?;

        Ok(())
    }
}
```

### Full Example with Token

```rust
use openzeppelin_stylus::token::erc20::{Erc20, IErc20};
use openzeppelin_stylus::access::control::{AccessControl, IAccessControl};

#[entrypoint]
#[storage]
struct MyToken {
    erc20: Erc20,
    access_control: AccessControl,
}

const DEFAULT_ADMIN_ROLE: B256 = B256::ZERO;
const MINTER_ROLE: B256 = /* keccak256("MINTER_ROLE") */;
const PAUSER_ROLE: B256 = /* keccak256("PAUSER_ROLE") */;

#[public]
impl MyToken {
    pub fn initialize(
        &mut self,
        default_admin: Address,
        minter: Address,
        pauser: Address,
    ) -> Result<(), Self::Error> {
        self.access_control._grant_role(DEFAULT_ADMIN_ROLE, default_admin)?;
        self.access_control._grant_role(MINTER_ROLE, minter)?;
        self.access_control._grant_role(PAUSER_ROLE, pauser)?;
        Ok(())
    }

    pub fn mint(&mut self, to: Address, amount: U256) -> Result<(), Self::Error> {
        self.access_control.only_role(MINTER_ROLE)?;
        self.erc20._mint(to, amount)?;
        Ok(())
    }

    pub fn burn(&mut self, from: Address, amount: U256) -> Result<(), Self::Error> {
        // Anyone can burn their own tokens
        self.erc20.burn(amount)?;
        Ok(())
    }
}
```

---

## Error Handling

Access control functions return `Result<T, Error>`:

```rust
#[derive(SolidityError)]
pub enum Error {
    OwnableUnauthorizedAccount(OwnableUnauthorizedAccount),
    OwnableInvalidOwner(OwnableInvalidOwner),
    AccessControlUnauthorizedAccount(AccessControlUnauthorizedAccount),
    AccessControlBadConfirmation(AccessControlBadConfirmation),
}
```

Usage:
```rust
pub fn admin_function(&mut self) -> Result<(), Self::Error> {
    self.ownable.only_owner()?;  // Returns error if not owner
    // ... function logic
    Ok(())
}
```

---

## Choosing a Pattern

| Requirement | Recommendation |
|-------------|----------------|
| Single admin | Ownable |
| Multiple roles | AccessControl |
| Simple contract | Ownable |
| Complex permissions | AccessControl |
| Mintable + Pausable | AccessControl with MINTER_ROLE and PAUSER_ROLE |
