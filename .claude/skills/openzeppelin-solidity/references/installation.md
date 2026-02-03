# Solidity Installation Guide

## Package Installation

### npm/yarn

```bash
# Standard contracts
npm install @openzeppelin/contracts
# or
yarn add @openzeppelin/contracts

# Upgradeable contracts
npm install @openzeppelin/contracts-upgradeable
# or
yarn add @openzeppelin/contracts-upgradeable
```

### Foundry

Add to `remappings.txt`:
```
@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/
@openzeppelin/contracts-upgradeable/=lib/openzeppelin-contracts-upgradeable/contracts/
```

Install via git submodules:
```bash
forge install OpenZeppelin/openzeppelin-contracts
forge install OpenZeppelin/openzeppelin-contracts-upgradeable
```

### Hardhat

Install packages, then configure `hardhat.config.js`:

```javascript
module.exports = {
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
```

## Import Patterns

### Standard Contracts

```solidity
// Token standards
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

// Access control
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";

// Extensions
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {ERC20FlashMint} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20FlashMint.sol";

// Utilities
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
```

### Upgradeable Contracts

```solidity
// Token standards
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

// Access control
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

// Proxy
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
```

## Version Compatibility

| Contracts Version | Solidity Version | Notes |
|-------------------|------------------|-------|
| ^5.0.0 | ^0.8.20 | Current, uses custom errors |
| ^4.0.0 | ^0.8.0 | Legacy, uses require strings |

## Project Structure

### Foundry Project

```
my-project/
├── foundry.toml
├── remappings.txt
├── lib/
│   └── openzeppelin-contracts/
├── src/
│   └── MyToken.sol
├── test/
│   └── MyToken.t.sol
└── script/
    └── Deploy.s.sol
```

### Hardhat Project

```
my-project/
├── hardhat.config.js
├── package.json
├── contracts/
│   └── MyToken.sol
├── test/
│   └── MyToken.test.js
└── scripts/
    └── deploy.js
```

## Common Issues

### Import Resolution

If imports fail, verify:
1. Package installed in `node_modules/` or `lib/`
2. Remappings configured correctly (Foundry)
3. Compiler version matches contract requirements

### Compiler Version Mismatch

OpenZeppelin Contracts v5 requires Solidity ^0.8.20:

```solidity
// Correct
pragma solidity ^0.8.27;

// May cause issues with v5
pragma solidity ^0.8.0;
```

### Upgradeable Import Confusion

Use `-Upgradeable` suffix for all upgradeable contracts:

```solidity
// WRONG - mixing standard and upgradeable
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// CORRECT - all upgradeable
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
```
