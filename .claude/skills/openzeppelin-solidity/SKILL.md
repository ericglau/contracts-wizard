---
name: openzeppelin-solidity
description: |
  Build secure Solidity smart contracts using OpenZeppelin Contracts for Ethereum and EVM-compatible chains. Use when users ask about: (1) ERC20 tokens with features like mintable, burnable, pausable, permit, votes, flash minting, cross-chain bridging, (2) ERC721 NFTs with enumerable, URI storage, royalties, (3) ERC1155 multi-tokens, (4) Governor contracts for DAOs, (5) ERC-4337 account abstraction, (6) Stablecoin contracts, (7) Access control (Ownable, Roles, Managed), (8) Upgradeable contracts (UUPS, Transparent proxy), (9) Uniswap v4 hooks. Targets: Ethereum, Polygon, Arbitrum, Base, Optimism, any EVM chain.
---

# OpenZeppelin Solidity Contracts

Build secure smart contracts for Ethereum and EVM-compatible chains.

## Installation

```bash
# npm
npm install @openzeppelin/contracts

# yarn
yarn add @openzeppelin/contracts

# Foundry (add to remappings.txt)
@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/
```

For upgradeable contracts:
```bash
npm install @openzeppelin/contracts-upgradeable
```

See [installation.md](references/installation.md) for detailed setup.

## Contract Types

| Type | When to Use | Reference |
|------|-------------|-----------|
| ERC20 | Fungible tokens, currencies | [tokens.md](references/tokens.md) |
| ERC721 | NFTs, unique assets | [tokens.md](references/tokens.md) |
| ERC1155 | Multi-token, gaming items | [tokens.md](references/tokens.md) |
| Governor | DAOs, on-chain voting | [governance.md](references/governance.md) |
| Account | Smart wallets, ERC-4337 | [accounts.md](references/accounts.md) |
| Stablecoin | Regulated tokens | [tokens.md](references/tokens.md) |

## Quick Start: ERC20 Token

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract MyToken is ERC20, ERC20Permit {
    constructor() ERC20("MyToken", "MTK") ERC20Permit("MyToken") {}
}
```

## Feature Composition

### Access Control Required When:

- `mintable: true` - mint() needs protection
- `pausable: true` - pause/unpause need protection
- `upgradeable: 'uups'` - _authorizeUpgrade() needs protection

### Feature Dependencies:

- **Votes requires Permit** - auto-enabled if Votes selected
- **Cross-chain + Premint requires Chain ID** - must specify premintChainId

## Reference Files

| Topic | File |
|-------|------|
| Installation & Setup | [installation.md](references/installation.md) |
| ERC20, ERC721, ERC1155 | [tokens.md](references/tokens.md) |
| Ownable, Roles, Managed | [access-control.md](references/access-control.md) |
| UUPS, Transparent Proxy | [upgradeability.md](references/upgradeability.md) |
| Governor, Timelock | [governance.md](references/governance.md) |
| ERC-4337 Accounts | [accounts.md](references/accounts.md) |
| Uniswap v4 Hooks | [uniswap-hooks.md](references/uniswap-hooks.md) |

## Inheritance Order

When combining features, use this order:

```solidity
contract MyToken is
    ERC20,           // Base token
    ERC20Burnable,   // Extensions
    ERC20Pausable,
    Ownable,         // Access control
    ERC20Permit,     // Permit (before Votes)
    ERC20Votes,      // Votes (after Permit)
    ERC20FlashMint   // Additional features
{
    // Constructor and overrides
}
```

## Override Requirements

When multiple parents override the same function, you must explicitly override:

```solidity
function _update(address from, address to, uint256 value)
    internal
    override(ERC20, ERC20Pausable, ERC20Votes)
{
    super._update(from, to, value);
}
```

Common overrides needed:
- `_update()` - ERC20Pausable, ERC20Votes, ERC20Capped
- `nonces()` - ERC20Permit, ERC20Votes
- `supportsInterface()` - ERC1155, AccessControl, ERC165
