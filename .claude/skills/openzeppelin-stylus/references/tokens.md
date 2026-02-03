# Stylus Token Standards

## Table of Contents

1. [ERC20 Fungible Tokens](#erc20-fungible-tokens)
2. [ERC721 Non-Fungible Tokens](#erc721-non-fungible-tokens)
3. [ERC1155 Multi-Tokens](#erc1155-multi-tokens)

---

## ERC20 Fungible Tokens

### Basic ERC20

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

### Available Features

| Feature | Module |
|---------|--------|
| Basic Transfer | `erc20::Erc20` |
| Burnable | `erc20::extensions::burnable` |
| Permit | `erc20::extensions::permit` |
| Flash Mint | `erc20::extensions::flash_mint` |

### ERC20 with Burnable

```rust
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
extern crate alloc;

use alloc::vec::Vec;
use openzeppelin_stylus::token::erc20::extensions::burnable::IErc20Burnable;
use openzeppelin_stylus::token::erc20::{self, Erc20, IErc20};
use stylus_sdk::alloy_primitives::{Address, U256};
use stylus_sdk::prelude::*;

#[entrypoint]
#[storage]
struct MyToken {
    erc20: Erc20,
}

#[public]
#[implements(IErc20<Error = erc20::Error>, IErc20Burnable<Error = erc20::Error>)]
impl MyToken {}
```

### ERC20 with Permit

```rust
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
extern crate alloc;

use alloc::vec::Vec;
use openzeppelin_stylus::token::erc20::extensions::permit::{self as permit, Erc20Permit, IErc20Permit};
use openzeppelin_stylus::token::erc20::{self, Erc20, IErc20};
use openzeppelin_stylus::utils::cryptography::{ecdsa, eip712::IEip712};
use openzeppelin_stylus::utils::nonces::{INonces, Nonces};
use stylus_sdk::alloy_primitives::{Address, B256, U256};
use stylus_sdk::prelude::*;

#[entrypoint]
#[storage]
struct MyToken {
    erc20: Erc20,
    erc20_permit: Erc20Permit<Eip712>,
    nonces: Nonces,
}

#[storage]
struct Eip712;

impl IEip712 for Eip712 {
    const NAME: &'static str = "MyToken";
    const VERSION: &'static str = "1";
}

#[public]
#[implements(IErc20<Error = permit::Error>, IErc20Permit<Error = permit::Error>, INonces)]
impl MyToken {}
```

### ERC20 with Flash Mint

```rust
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
extern crate alloc;

use alloc::vec::Vec;
use openzeppelin_stylus::token::erc20::extensions::flash_mint::{self as flash_mint, Erc20FlashMint, IErc3156FlashLender};
use openzeppelin_stylus::token::erc20::{self, Erc20, IErc20};
use stylus_sdk::abi::Bytes;
use stylus_sdk::alloy_primitives::{Address, U256};
use stylus_sdk::prelude::*;

#[entrypoint]
#[storage]
struct MyToken {
    erc20: Erc20,
    flash_mint: Erc20FlashMint,
}

#[public]
#[implements(IErc20<Error = flash_mint::Error>, IErc3156FlashLender<Error = flash_mint::Error>)]
impl MyToken {}
```

---

## ERC721 Non-Fungible Tokens

### Basic ERC721

```rust
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
extern crate alloc;

use alloc::vec::Vec;
use openzeppelin_stylus::token::erc721::{self, Erc721, IErc721};
use openzeppelin_stylus::utils::introspection::erc165::IErc165;
use stylus_sdk::abi::Bytes;
use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};
use stylus_sdk::prelude::*;

#[entrypoint]
#[storage]
struct MyToken {
    erc721: Erc721,
}

#[public]
#[implements(IErc721<Error = erc721::Error>, IErc165)]
impl MyToken {}
```

### ERC721 with Burnable

```rust
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
extern crate alloc;

use alloc::vec::Vec;
use openzeppelin_stylus::token::erc721::extensions::burnable::IErc721Burnable;
use openzeppelin_stylus::token::erc721::{self, Erc721, IErc721};
use openzeppelin_stylus::utils::introspection::erc165::IErc165;
use stylus_sdk::abi::Bytes;
use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};
use stylus_sdk::prelude::*;

#[entrypoint]
#[storage]
struct MyToken {
    erc721: Erc721,
}

#[public]
#[implements(IErc721<Error = erc721::Error>, IErc721Burnable<Error = erc721::Error>, IErc165)]
impl MyToken {}
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
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
extern crate alloc;

use alloc::vec::Vec;
use openzeppelin_stylus::token::erc1155::{self, Erc1155, IErc1155};
use openzeppelin_stylus::utils::introspection::erc165::IErc165;
use stylus_sdk::abi::Bytes;
use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};
use stylus_sdk::prelude::*;

#[entrypoint]
#[storage]
struct MyToken {
    erc1155: Erc1155,
}

#[public]
#[implements(IErc1155<Error = erc1155::Error>, IErc165)]
impl MyToken {}
```

### ERC1155 with Burnable

```rust
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
extern crate alloc;

use alloc::vec::Vec;
use openzeppelin_stylus::token::erc1155::extensions::IErc1155Burnable;
use openzeppelin_stylus::token::erc1155::{self, Erc1155, IErc1155};
use openzeppelin_stylus::utils::introspection::erc165::IErc165;
use stylus_sdk::abi::Bytes;
use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};
use stylus_sdk::prelude::*;

#[entrypoint]
#[storage]
struct MyToken {
    erc1155: Erc1155,
}

#[public]
#[implements(IErc1155<Error = erc1155::Error>, IErc1155Burnable<Error = erc1155::Error>, IErc165)]
impl MyToken {}
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
