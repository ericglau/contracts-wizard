# Cairo Installation Guide

## Prerequisites

- [Scarb](https://docs.swmansion.com/scarb/) - Cairo package manager
- [Starknet Foundry](https://foundry-rs.github.io/starknet-foundry/) (optional, for testing)

## Package Installation

### Scarb.toml Configuration

```toml
[package]
name = "my_project"
version = "0.1.0"
edition = "2024_07"

[dependencies]
starknet = "2.8.4"
openzeppelin = { git = "https://github.com/OpenZeppelin/cairo-contracts.git", tag = "v0.15.0" }

[tool.fmt]
sort-module-level-items = true
```

### Version Compatibility

| OZ Contracts | Cairo | Starknet |
|--------------|-------|----------|
| v0.15.0 | 2.8.x | 2.8.x |
| v0.14.0 | 2.7.x | 2.7.x |

## Import Patterns

### Token Components

```cairo
// ERC20
use openzeppelin_token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
use openzeppelin_token::erc20::interface::{IERC20, IERC20Metadata};

// ERC721
use openzeppelin_token::erc721::{ERC721Component, ERC721HooksEmptyImpl};
use openzeppelin_token::erc721::interface::{IERC721, IERC721Metadata};

// ERC1155
use openzeppelin_token::erc1155::{ERC1155Component, ERC1155HooksEmptyImpl};
use openzeppelin_token::erc1155::interface::IERC1155;
```

### Access Control Components

```cairo
// Ownable
use openzeppelin_access::ownable::OwnableComponent;
use openzeppelin_access::ownable::interface::IOwnable;

// AccessControl (Roles)
use openzeppelin_access::accesscontrol::AccessControlComponent;
use openzeppelin_access::accesscontrol::interface::IAccessControl;

// DefaultAdminRules
use openzeppelin_access::accesscontrol::AccessControlDefaultAdminRulesComponent;
```

### Upgradeability

```cairo
use openzeppelin_upgrades::UpgradeableComponent;
use openzeppelin_upgrades::interface::IUpgradeable;
```

### Governance

```cairo
use openzeppelin_governance::governor::GovernorComponent;
use openzeppelin_governance::timelock::TimelockControllerComponent;
use openzeppelin_governance::multisig::MultisigComponent;
use openzeppelin_governance::vesting::VestingComponent;
```

### Utilities

```cairo
use openzeppelin_utils::pausable::PausableComponent;
use openzeppelin_utils::nonces::NoncesComponent;
use openzeppelin_introspection::src5::SRC5Component;
```

## Project Structure

```
my_project/
├── Scarb.toml
├── src/
│   ├── lib.cairo
│   └── my_token.cairo
└── tests/
    └── test_my_token.cairo
```

### lib.cairo

```cairo
mod my_token;

#[cfg(test)]
mod tests;
```

## Common Issues

### Import Errors

Verify Scarb.toml has correct version and run:
```bash
scarb clean
scarb build
```

### Component Not Found

Ensure you're importing from the correct module path:
```cairo
// Correct
use openzeppelin_token::erc20::ERC20Component;

// Wrong
use openzeppelin::token::erc20::ERC20Component;
```

### Storage Type Mismatch

Component storage must match exactly:
```cairo
#[storage]
struct Storage {
    #[substorage(v0)]
    erc20: ERC20Component::Storage,  // Must be ::Storage
}
```

## Building and Testing

```bash
# Build
scarb build

# Test with Starknet Foundry
snforge test

# Format
scarb fmt
```

## Deployment

Using Starknet Foundry:
```bash
sncast declare --contract-name MyToken

sncast deploy \
    --class-hash <CLASS_HASH> \
    --constructor-calldata <ARGS>
```
