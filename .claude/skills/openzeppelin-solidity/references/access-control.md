# Solidity Access Control

## Table of Contents

1. [Overview](#overview)
2. [Ownable](#ownable)
3. [AccessControl (Roles)](#accesscontrol-roles)
4. [AccessManaged](#accessmanaged)
5. [When Access Control is Required](#when-access-control-is-required)

---

## Overview

Three access control patterns available:

| Pattern | Use Case | Complexity |
|---------|----------|------------|
| Ownable | Single admin, simple contracts | Low |
| AccessControl | Multiple roles, complex permissions | Medium |
| AccessManaged | External authority, upgradeable policies | High |

---

## Ownable

Single account controls all privileged functions.

### Basic Usage

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor(address initialOwner)
        ERC20("MyToken", "MTK")
        Ownable(initialOwner)
    {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
```

### Key Functions

| Function | Description |
|----------|-------------|
| `owner()` | Returns current owner address |
| `transferOwnership(newOwner)` | Transfer to new owner |
| `renounceOwnership()` | Permanently remove owner |

### Modifier

```solidity
modifier onlyOwner() {
    _checkOwner();
    _;
}
```

### Two-Step Transfer (Ownable2Step)

For safer ownership transfers:

```solidity
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

contract MyToken is ERC20, Ownable2Step {
    constructor(address initialOwner)
        ERC20("MyToken", "MTK")
        Ownable(initialOwner)
    {}
}
```

New owner must call `acceptOwnership()` to complete transfer.

---

## AccessControl (Roles)

Multiple roles with granular permissions.

### Basic Usage

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract MyToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    constructor(address defaultAdmin, address minter, address pauser)
        ERC20("MyToken", "MTK")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, minter);
        _grantRole(PAUSER_ROLE, pauser);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
}
```

### Role Definition

Roles are `bytes32` values, typically created with `keccak256`:

```solidity
bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
```

### Key Functions

| Function | Description |
|----------|-------------|
| `hasRole(role, account)` | Check if account has role |
| `grantRole(role, account)` | Grant role (admin only) |
| `revokeRole(role, account)` | Revoke role (admin only) |
| `renounceRole(role, account)` | Self-remove from role |
| `getRoleAdmin(role)` | Get admin role for a role |

### Role Hierarchy

Set custom admin roles:

```solidity
constructor() {
    _setRoleAdmin(MINTER_ROLE, MINTER_ADMIN_ROLE);
    // Now MINTER_ADMIN_ROLE can grant/revoke MINTER_ROLE
}
```

### Modifier

```solidity
modifier onlyRole(bytes32 role) {
    _checkRole(role);
    _;
}
```

### Common Role Names

| Role | Purpose |
|------|---------|
| `DEFAULT_ADMIN_ROLE` | Can grant/revoke all roles |
| `MINTER_ROLE` | Can mint new tokens |
| `PAUSER_ROLE` | Can pause/unpause |
| `UPGRADER_ROLE` | Can upgrade contract (UUPS) |
| `BURNER_ROLE` | Can burn tokens |
| `FREEZER_ROLE` | Can freeze accounts |

---

## AccessManaged

Delegate access control to external authority contract.

### Basic Usage

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";

contract MyToken is ERC20, AccessManaged {
    constructor(address initialAuthority)
        ERC20("MyToken", "MTK")
        AccessManaged(initialAuthority)
    {}

    function mint(address to, uint256 amount) public restricted {
        _mint(to, amount);
    }

    function pause() public restricted {
        _pause();
    }
}
```

### Modifier

```solidity
modifier restricted() {
    _checkCanCall(msg.sender, msg.data);
    _;
}
```

### AccessManager Contract

Deploy an `AccessManager` to manage permissions:

```solidity
import {AccessManager} from "@openzeppelin/contracts/access/manager/AccessManager.sol";

// Deploy manager
AccessManager manager = new AccessManager(admin);

// Configure permissions
manager.setTargetFunctionRole(
    address(myToken),
    [MyToken.mint.selector],
    MINTER_ROLE
);
```

### When to Use

- Centralized permission management across multiple contracts
- Complex, upgradeable access policies
- Time-delayed operations
- Multi-tenant systems

---

## When Access Control is Required

Certain features automatically require access control:

### Mintable Tokens

```solidity
// Mint function needs protection
function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
}
```

### Pausable Contracts

```solidity
// Pause/unpause need protection
function pause() public onlyOwner {
    _pause();
}

function unpause() public onlyOwner {
    _unpause();
}
```

### UUPS Upgradeable

```solidity
// _authorizeUpgrade needs protection
function _authorizeUpgrade(address newImplementation)
    internal
    onlyOwner
    override
{}
```

### Summary Table

| Feature | Access Control Required |
|---------|------------------------|
| Mintable | Yes |
| Burnable | No (holder burns own) |
| Pausable | Yes |
| UUPS Upgradeable | Yes |
| Transparent Upgradeable | No (proxy admin separate) |
| Flash Mint | No |
| Permit | No |
| Votes | No |

---

## Choosing an Access Control Pattern

```
Simple contract, single admin?
    └── Yes → Use Ownable
    └── No → Multiple roles needed?
        └── Yes → Use AccessControl
        └── No → Centralized policy management?
            └── Yes → Use AccessManaged
            └── No → Use Ownable
```

### Comparison

| Aspect | Ownable | AccessControl | AccessManaged |
|--------|---------|---------------|---------------|
| Roles | 1 (owner) | Unlimited | Unlimited |
| On-chain config | Constructor | Constructor + runtime | External manager |
| Gas cost | Lowest | Medium | Highest |
| Flexibility | Low | High | Highest |
| Upgradeable policy | No | Limited | Yes |
