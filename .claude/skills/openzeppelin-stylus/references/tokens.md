# Stylus Token Standards

## Table of Contents

1. [ERC20 Fungible Tokens](#erc20-fungible-tokens)
2. [ERC721 Non-Fungible Tokens](#erc721-non-fungible-tokens)
3. [ERC1155 Multi-Tokens](#erc1155-multi-tokens)

---

## ERC20 Fungible Tokens

### Basic ERC20

```rust
#![cfg_attr(not(any(test, feature = "std")), no_std)]
extern crate alloc;

use alloc::vec::Vec;
use stylus_sdk::prelude::*;
use stylus_sdk::alloy_primitives::{Address, U256};
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
impl MyToken {}
```

### Available Features

| Feature | Module |
|---------|--------|
| Basic Transfer | `erc20::Erc20` |
| Burnable | `erc20::extensions::burnable` |
| Permit | `erc20::extensions::permit` |
| Flash Mint | `erc20::extensions::flash_mint` |

### ERC20 with Burnable

```rust
use openzeppelin_stylus::token::erc20::{Erc20, IErc20};
use openzeppelin_stylus::token::erc20::extensions::burnable::IErc20Burnable;

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
    pub fn burn(&mut self, value: U256) -> Result<(), Self::Error> {
        self.erc20.burn(value)
    }

    pub fn burn_from(&mut self, account: Address, value: U256) -> Result<(), Self::Error> {
        self.erc20.burn_from(account, value)
    }
}
```

### ERC20 with Permit

```rust
use openzeppelin_stylus::token::erc20::{Erc20, IErc20};
use openzeppelin_stylus::token::erc20::extensions::permit::{Erc20Permit, IErc20Permit};
use openzeppelin_stylus::utils::nonces::Nonces;
use openzeppelin_stylus::utils::cryptography::eip712::Eip712;

sol_storage! {
    #[entrypoint]
    pub struct MyToken {
        #[borrow]
        Erc20 erc20;
        #[borrow]
        Erc20Permit<Eip712> erc20_permit;
        #[borrow]
        Nonces nonces;
    }
}

#[public]
#[inherit(Erc20)]
impl MyToken {
    #[selector(name = "DOMAIN_SEPARATOR")]
    pub fn domain_separator(&self) -> B256 {
        self.erc20_permit.domain_separator()
    }

    pub fn permit(
        &mut self,
        owner: Address,
        spender: Address,
        value: U256,
        deadline: U256,
        v: u8,
        r: B256,
        s: B256,
    ) -> Result<(), Self::Error> {
        self.erc20_permit.permit(
            owner, spender, value, deadline, v, r, s,
            &mut self.erc20, &mut self.nonces
        )
    }

    pub fn nonces(&self, owner: Address) -> U256 {
        self.nonces.nonces(owner)
    }
}
```

### ERC20 with Flash Mint

```rust
use openzeppelin_stylus::token::erc20::{Erc20, IErc20};
use openzeppelin_stylus::token::erc20::extensions::flash_mint::{Erc20FlashMint, IErc3156FlashLender};
use stylus_sdk::abi::Bytes;

sol_storage! {
    #[entrypoint]
    pub struct MyToken {
        #[borrow]
        Erc20 erc20;
        #[borrow]
        Erc20FlashMint flash_mint;
    }
}

#[public]
#[inherit(Erc20)]
impl MyToken {
    pub fn max_flash_loan(&self, token: Address) -> U256 {
        self.flash_mint.max_flash_loan(token, &self.erc20)
    }

    pub fn flash_fee(&self, token: Address, value: U256) -> Result<U256, Self::Error> {
        self.flash_mint.flash_fee(token, value)
    }

    pub fn flash_loan(
        &mut self,
        receiver: Address,
        token: Address,
        value: U256,
        data: &Bytes,
    ) -> Result<bool, Self::Error> {
        self.flash_mint.flash_loan(receiver, token, value, data, &mut self.erc20)
    }
}
```

---

## ERC721 Non-Fungible Tokens

### Basic ERC721

```rust
#![cfg_attr(not(any(test, feature = "std")), no_std)]
extern crate alloc;

use alloc::vec::Vec;
use stylus_sdk::prelude::*;
use stylus_sdk::alloy_primitives::{Address, U256};
use openzeppelin_stylus::token::erc721::{Erc721, IErc721};

sol_storage! {
    #[entrypoint]
    pub struct MyNFT {
        #[borrow]
        Erc721 erc721;
    }
}

#[public]
#[inherit(Erc721)]
impl MyNFT {}
```

### ERC721 with Burnable

```rust
use openzeppelin_stylus::token::erc721::{Erc721, IErc721};
use openzeppelin_stylus::token::erc721::extensions::burnable::IErc721Burnable;

sol_storage! {
    #[entrypoint]
    pub struct MyNFT {
        #[borrow]
        Erc721 erc721;
    }
}

#[public]
#[inherit(Erc721)]
impl MyNFT {
    pub fn burn(&mut self, token_id: U256) -> Result<(), Self::Error> {
        self.erc721.burn(token_id)
    }
}
```

### Key ERC721 Functions

```rust
// Query functions
fn balance_of(&self, owner: Address) -> U256;
fn owner_of(&self, token_id: U256) -> Address;

// Transfer functions
fn transfer_from(&mut self, from: Address, to: Address, token_id: U256) -> Result<(), Error>;
fn safe_transfer_from(&mut self, from: Address, to: Address, token_id: U256) -> Result<(), Error>;
fn safe_transfer_from_with_data(&mut self, from: Address, to: Address, token_id: U256, data: Bytes) -> Result<(), Error>;

// Approval functions
fn approve(&mut self, to: Address, token_id: U256) -> Result<(), Error>;
fn set_approval_for_all(&mut self, operator: Address, approved: bool) -> Result<(), Error>;
fn get_approved(&self, token_id: U256) -> Address;
fn is_approved_for_all(&self, owner: Address, operator: Address) -> bool;
```

---

## ERC1155 Multi-Tokens

### Basic ERC1155

```rust
#![cfg_attr(not(any(test, feature = "std")), no_std)]
extern crate alloc;

use alloc::vec::Vec;
use stylus_sdk::prelude::*;
use stylus_sdk::alloy_primitives::{Address, U256};
use openzeppelin_stylus::token::erc1155::{Erc1155, IErc1155};

sol_storage! {
    #[entrypoint]
    pub struct MyMultiToken {
        #[borrow]
        Erc1155 erc1155;
    }
}

#[public]
#[inherit(Erc1155)]
impl MyMultiToken {}
```

### ERC1155 with Burnable

```rust
use openzeppelin_stylus::token::erc1155::{Erc1155, IErc1155};
use openzeppelin_stylus::token::erc1155::extensions::burnable::IErc1155Burnable;

sol_storage! {
    #[entrypoint]
    pub struct MyMultiToken {
        #[borrow]
        Erc1155 erc1155;
    }
}

#[public]
#[inherit(Erc1155)]
impl MyMultiToken {
    pub fn burn(&mut self, account: Address, id: U256, value: U256) -> Result<(), Self::Error> {
        self.erc1155.burn(account, id, value)
    }

    pub fn burn_batch(
        &mut self,
        account: Address,
        ids: Vec<U256>,
        values: Vec<U256>,
    ) -> Result<(), Self::Error> {
        self.erc1155.burn_batch(account, ids, values)
    }
}
```

### Key ERC1155 Functions

```rust
// Query functions
fn balance_of(&self, account: Address, id: U256) -> U256;
fn balance_of_batch(&self, accounts: Vec<Address>, ids: Vec<U256>) -> Vec<U256>;

// Transfer functions
fn safe_transfer_from(&mut self, from: Address, to: Address, id: U256, value: U256, data: Bytes) -> Result<(), Error>;
fn safe_batch_transfer_from(&mut self, from: Address, to: Address, ids: Vec<U256>, values: Vec<U256>, data: Bytes) -> Result<(), Error>;

// Approval functions
fn set_approval_for_all(&mut self, operator: Address, approved: bool) -> Result<(), Error>;
fn is_approved_for_all(&self, account: Address, operator: Address) -> bool;
```

---

## Error Handling

All token functions return `Result<T, Self::Error>`:

```rust
#[derive(SolidityError)]
pub enum Error {
    InsufficientBalance(ERC20InsufficientBalance),
    InvalidSender(ERC20InvalidSender),
    InvalidReceiver(ERC20InvalidReceiver),
    InsufficientAllowance(ERC20InsufficientAllowance),
    InvalidSpender(ERC20InvalidSpender),
    InvalidApprover(ERC20InvalidApprover),
}
```

Usage:
```rust
pub fn transfer(&mut self, to: Address, value: U256) -> Result<bool, Self::Error> {
    self.erc20.transfer(to, value)?;  // Propagates error if fails
    Ok(true)
}
```
