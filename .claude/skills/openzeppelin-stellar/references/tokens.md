# Stellar Token Standards

## Table of Contents

1. [Fungible Tokens](#fungible-tokens)
2. [Non-Fungible Tokens](#non-fungible-tokens)
3. [Stablecoin Tokens](#stablecoin-tokens)

---

## Fungible Tokens

### Basic Fungible Token

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String};
use stellar_tokens::fungible::{Base, FungibleToken};

#[contract]
pub struct MyToken;

#[contractimpl]
impl FungibleToken for MyToken {}

#[contractimpl]
impl MyToken {
    pub fn __constructor(e: &Env) {
        // Fixed 7 decimals for Stellar
        Base::set_metadata(e, 7, String::from_str(e, "MyToken"), String::from_str(e, "MTK"));
    }
}
```

### Important: Fixed 7 Decimals

Stellar tokens always have exactly 7 decimals:

```rust
// CORRECT - Always 7
Base::set_metadata(e, 7, name, symbol);

// WRONG - Don't use other values
Base::set_metadata(e, 18, name, symbol);  // Will not work as expected
```

### Available Features

| Feature | Implementation |
|---------|----------------|
| Basic Transfer | `FungibleToken` trait |
| Burnable | `FungibleBurnable` trait |
| Mintable | `Base::mint()` |
| Pausable | `pausable` module + macros |

### Fungible Token with Premint

```rust
use stellar_access::ownable;
#[contractimpl]
impl MyToken {
    pub fn __constructor(e: &Env, admin: Address, recipient: Address, amount: i128) {
        Base::set_metadata(
            e,
            7,
            String::from_str(e, "MyToken"),
            String::from_str(e, "MTK"),
        );
        ownable::set_owner(e, &admin);

        // Premint tokens (amount should account for 7 decimals)
        // For 1 million tokens: 1_000_000 * 10^7 = 10_000_000_000_000
        Base::mint(e, &recipient, amount);
    }
}
```

### Fungible Token with Burnable

```rust
use stellar_tokens::fungible::{Base, burnable::FungibleBurnable, FungibleToken};

#[contract]
pub struct MyToken;

#[contractimpl]
impl FungibleToken for MyToken {}

#[contractimpl]
impl FungibleBurnable for MyToken {}

#[contractimpl]
impl MyToken {
    pub fn __constructor(e: &Env, admin: Address) {
        Base::set_metadata(e, 7, String::from_str(e, "MyToken"), String::from_str(e, "MTK"));
        ownable::set_owner(e, &admin);
    }
}
```

### Fungible Token with Mintable + Pausable

```rust
use stellar_macros::{only_owner, when_not_paused};
use stellar_access::ownable;
use stellar_contract_utils::pausable;
use stellar_tokens::fungible::{Base, FungibleToken};

#[contract]
pub struct MyToken;

// Override transfer to add pause check
#[contractimpl]
impl FungibleToken for MyToken {
    #[when_not_paused]
    fn transfer(e: &Env, from: &Address, to: &MuxedAddress, amount: i128) {
        from.require_auth();
        Base::transfer(e, from, &to.address(), amount);
    }
}

#[contractimpl]
impl MyToken {
    pub fn __constructor(e: &Env, admin: Address) {
        Base::set_metadata(e, 7, String::from_str(e, "MyToken"), String::from_str(e, "MTK"));
        ownable::set_owner(e, &admin);
    }

    #[only_owner]
    pub fn mint(e: &Env, to: &Address, amount: i128) {
        Base::mint(e, to, amount);
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

### Approve with Ledger Expiration

Stellar approvals expire at a ledger number:

```rust
#[contractimpl]
impl FungibleToken for MyToken {
    fn approve(e: &Env, owner: &Address, spender: &Address, amount: i128, live_until_ledger: u32) {
        owner.require_auth();
        Base::approve(e, owner, spender, amount, live_until_ledger);
    }
}
```

---

## Non-Fungible Tokens

### Basic NFT

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String};
use stellar_tokens::non_fungible::{Base, NonFungibleToken};

#[contract]
pub struct MyNFT;

#[contractimpl]
impl NonFungibleToken for MyNFT {}

#[contractimpl]
impl MyNFT {
    pub fn __constructor(e: &Env) {
        let uri = String::from_str(e, "https://www.mytoken.com");
        let name = String::from_str(e, "MyNFT");
        let symbol = String::from_str(e, "MNFT");
        Base::set_metadata(e, uri, name, symbol);
    }
}
```

### NFT with Mintable

```rust
use stellar_macros::only_owner;

#[contractimpl]
impl MyNFT {
    pub fn __constructor(e: &Env) {
        let uri = String::from_str(e, "https://www.mytoken.com");
        let name = String::from_str(e, "MyNFT");
        let symbol = String::from_str(e, "MNFT");
        Base::set_metadata(e, uri, name, symbol);
    }

    #[only_owner]
    pub fn mint(e: &Env, to: &Address, token_id: i128) {
        Base::mint(e, to, token_id);
    }

    #[only_owner]
    pub fn mint_with_uri(e: &Env, to: &Address, token_id: i128, uri: String) {
        Base::mint(e, to, token_id);
        Base::set_token_uri(e, token_id, uri);
    }
}
```

### NFT with Burnable

```rust
use stellar_tokens::non_fungible::{Base, burnable::NonFungibleBurnable, NonFungibleToken};

#[contract]
pub struct MyNFT;

#[contractimpl]
impl NonFungibleToken for MyNFT {}

#[contractimpl]
impl NonFungibleBurnable for MyNFT {}
```

---

## Stablecoin Tokens

### Basic Stablecoin

Stablecoins extend fungible tokens with compliance features:

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol};
use stellar_access::access_control;
use stellar_contract_utils::pausable;
use stellar_tokens::fungible::{Base, FungibleToken};
use stellar_macros::{only_role, when_not_paused};

#[contract]
pub struct MyStablecoin;

const MINTER_ROLE: Symbol = Symbol::short("MINTER");
const PAUSER_ROLE: Symbol = Symbol::short("PAUSER");
const FREEZER_ROLE: Symbol = Symbol::short("FREEZER");

#[contractimpl]
impl FungibleToken for MyStablecoin {
    #[when_not_paused]
    fn transfer(e: &Env, from: &Address, to: &MuxedAddress, amount: i128) {
        // Check frozen status
        enforce_not_frozen(e, from);
        enforce_not_frozen(e, &to.address());

        from.require_auth();
        Base::transfer(e, from, &to.address(), amount);
    }
}

#[contractimpl]
impl MyStablecoin {
    pub fn __constructor(e: &Env, admin: Address, minter: Address, pauser: Address) {
        Base::set_metadata(e, 7, String::from_str(e, "USD Coin"), String::from_str(e, "USDC"));
        access_control::set_admin(e, &admin);
        access_control::grant_role_no_auth(e, &minter, &MINTER_ROLE, &admin);
        access_control::grant_role_no_auth(e, &pauser, &PAUSER_ROLE, &admin);
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

    #[only_role(caller, "FREEZER")]
    pub fn freeze(e: &Env, caller: &Address, account: &Address) {
        set_frozen(e, account, true);
    }

    #[only_role(caller, "FREEZER")]
    pub fn unfreeze(e: &Env, caller: &Address, account: &Address) {
        set_frozen(e, account, false);
    }
}

// Helper functions for freezing
fn set_frozen(e: &Env, account: &Address, frozen: bool) {
    e.storage().instance().set(&(Symbol::short("frozen"), account), &frozen);
}

fn is_frozen(e: &Env, account: &Address) -> bool {
    e.storage().instance().get(&(Symbol::short("frozen"), account)).unwrap_or(false)
}

fn enforce_not_frozen(e: &Env, account: &Address) {
    if is_frozen(e, account) {
        panic!("Account is frozen");
    }
}
```

### Stablecoin Features

| Feature | Description |
|---------|-------------|
| Freezable | Freeze/unfreeze accounts |
| Pausable | Emergency pause all transfers |
| Role-Based Minting | Only authorized minters |
| Compliance | KYC/AML integration points |
