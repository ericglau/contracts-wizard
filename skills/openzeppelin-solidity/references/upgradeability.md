# Solidity Upgradeability

## Table of Contents

1. [Overview](#overview)
2. [Transparent Proxy](#transparent-proxy)
3. [UUPS Proxy](#uups-proxy)
4. [Storage Layout Rules](#storage-layout-rules)
5. [Namespaced Storage (ERC-7201)](#namespaced-storage-erc-7201)
6. [Migration Guide](#migration-guide)

---

## Overview

Two proxy patterns available:

| Pattern | Upgrade Logic | Access Control Required | Gas Overhead |
|---------|---------------|------------------------|--------------|
| Transparent | In proxy | No (separate admin) | Higher |
| UUPS | In implementation | Yes | Lower |

---

## Transparent Proxy

Upgrade logic lives in the proxy contract. Admin is separate from users.

### Implementation Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MyTokenV1 is Initializable, ERC20Upgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(string memory name, string memory symbol) initializer public {
        __ERC20_init(name, symbol);
    }
}
```

### Deployment

```javascript
// Using OpenZeppelin Upgrades plugin
const MyToken = await ethers.getContractFactory("MyTokenV1");
const proxy = await upgrades.deployProxy(MyToken, ["MyToken", "MTK"], {
    kind: "transparent"
});
```

### Upgrade

```javascript
const MyTokenV2 = await ethers.getContractFactory("MyTokenV2");
await upgrades.upgradeProxy(proxy.address, MyTokenV2);
```

---

## UUPS Proxy

Upgrade logic lives in the implementation contract. Lower gas but requires access control.

### Implementation Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MyTokenV1 is Initializable, ERC20Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) initializer public {
        __ERC20_init("MyToken", "MTK");
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}
}
```

### With Roles

```solidity
contract MyTokenV1 is Initializable, ERC20Upgradeable, AccessControlUpgradeable, UUPSUpgradeable {
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    function initialize(address defaultAdmin, address upgrader) initializer public {
        __ERC20_init("MyToken", "MTK");
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(UPGRADER_ROLE, upgrader);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(UPGRADER_ROLE)
        override
    {}
}
```

### Deployment

```javascript
const MyToken = await ethers.getContractFactory("MyTokenV1");
const proxy = await upgrades.deployProxy(MyToken, [owner.address], {
    kind: "uups"
});
```

---

## Storage Layout Rules

### Golden Rules

1. **Never remove or reorder existing variables**
2. **Only add new variables at the end**
3. **Never change variable types**
4. **Use storage gaps for inheritance**

### Storage Gaps

Reserve space for future variables in base contracts:

```solidity
contract MyBaseV1 is Initializable {
    uint256 public value;

    // Reserve 49 slots for future use
    uint256[49] private __gap;
}

contract MyBaseV2 is Initializable {
    uint256 public value;
    uint256 public newValue; // Added in V2

    // Now reserve 48 slots
    uint256[48] private __gap;
}
```

### Invalid Changes

```solidity
// V1
contract MyToken {
    uint256 public totalMinted;
    address public admin;
}

// V2 - WRONG: reordered variables
contract MyToken {
    address public admin;      // Was slot 1, now slot 0
    uint256 public totalMinted; // Was slot 0, now slot 1
}

// V2 - WRONG: changed type
contract MyToken {
    uint128 public totalMinted; // Changed from uint256
    address public admin;
}

// V2 - CORRECT: only added at end
contract MyToken {
    uint256 public totalMinted;
    address public admin;
    uint256 public newVariable; // Added at end
}
```

---

## Namespaced Storage (ERC-7201)

Isolate storage to prevent collisions in complex inheritance.

### When Required

- Upgradeable contracts with custom state variables
- Cross-chain bridging with custom bridge storage
- Complex inheritance hierarchies

### Implementation

```solidity
contract MyToken is ERC20Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    /// @custom:storage-location erc7201:myproject.storage.MyToken
    struct MyTokenStorage {
        address tokenBridge;
        uint256 bridgeFee;
    }

    // keccak256(abi.encode(uint256(keccak256("myproject.storage.MyToken")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant MyTokenStorageLocation = 0x...;

    function _getMyTokenStorage() private pure returns (MyTokenStorage storage $) {
        assembly {
            $.slot := MyTokenStorageLocation
        }
    }

    function setTokenBridge(address bridge) public onlyOwner {
        MyTokenStorage storage $ = _getMyTokenStorage();
        $.tokenBridge = bridge;
    }

    function getTokenBridge() public view returns (address) {
        MyTokenStorage storage $ = _getMyTokenStorage();
        return $.tokenBridge;
    }
}
```

### Namespace ID Calculation

```solidity
// Formula: keccak256(abi.encode(uint256(keccak256("namespace.id")) - 1)) & ~bytes32(uint256(0xff))

// Example for "myproject.storage.MyToken":
bytes32 constant SLOT = 0x1234...00; // Last byte always 0x00
```

---

## Migration Guide

### Converting Constructor to Initializer

**Before (non-upgradeable):**
```solidity
contract MyToken is ERC20 {
    constructor(address owner) ERC20("MyToken", "MTK") {
        _mint(owner, 1000000 * 10 ** decimals());
    }
}
```

**After (upgradeable):**
```solidity
contract MyToken is Initializable, ERC20Upgradeable, OwnableUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address owner) initializer public {
        __ERC20_init("MyToken", "MTK");
        __Ownable_init(owner);
        _mint(owner, 1000000 * 10 ** decimals());
    }
}
```

### Checklist

- [ ] Replace `constructor` with `initialize` function
- [ ] Add `initializer` modifier to `initialize`
- [ ] Call `__ContractName_init()` for each parent
- [ ] Add `_disableInitializers()` in constructor
- [ ] Use `-Upgradeable` versions of all imports
- [ ] Remove `immutable` variables (use storage instead)
- [ ] Add storage gaps to base contracts

### Parent Initialization Order

Initialize in linearized inheritance order:

```solidity
function initialize(address owner) initializer public {
    __ERC20_init("MyToken", "MTK");        // First parent
    __ERC20Burnable_init();                 // Extensions
    __ERC20Pausable_init();
    __Ownable_init(owner);                  // Access control
    __UUPSUpgradeable_init();               // Upgradeability last
}
```

---

## Comparison: UUPS vs Transparent

| Aspect | UUPS | Transparent |
|--------|------|-------------|
| Upgrade function location | Implementation | Proxy |
| Access control | Required in implementation | Separate ProxyAdmin |
| Gas (deployment) | Lower | Higher |
| Gas (calls) | Lower | Higher |
| Complexity | Medium | Lower |
| Beacon support | No | Yes |
| Remove upgradeability | Remove function | Transfer admin to 0x0 |

### Choose UUPS When

- Gas efficiency is important
- You want upgrade logic in your contract
- You're comfortable with access control

### Choose Transparent When

- You want separate admin management
- Using beacon proxies
- Simpler upgrade process preferred
