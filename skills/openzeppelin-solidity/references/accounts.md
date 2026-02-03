# Solidity Account Abstraction (ERC-4337)

## Table of Contents

1. [Overview](#overview)
2. [Basic Account](#basic-account)
3. [Signature Validation](#signature-validation)
4. [Token Receivers](#token-receivers)
5. [Modules (ERC-7579)](#modules-erc-7579)
6. [Batched Execution (ERC-7821)](#batched-execution-erc-7821)

---

## Overview

ERC-4337 account abstraction enables smart contract wallets with:
- Custom signature validation
- Sponsored transactions
- Batched operations
- Social recovery

---

## Basic Account

### Minimal Account

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Account} from "@openzeppelin/contracts/account/Account.sol";
import {ERC7821} from "@openzeppelin/contracts/account/extensions/ERC7821.sol";
import {SignerECDSA} from "@openzeppelin/contracts/account/extensions/SignerECDSA.sol";

contract MyAccount is Account, ERC7821, SignerECDSA {
    constructor(address signer) SignerECDSA(signer) {}
}
```

### Account Architecture

```
UserOperation
    ↓
EntryPoint (singleton)
    ↓ validateUserOp()
Account Contract
    ↓ _validateSignature()
Signer Extension
```

---

## Signature Validation

### Signer Types

| Signer | Use Case | Import |
|--------|----------|--------|
| ECDSA | Standard EOA signatures | `SignerECDSA` |
| EIP-7702 | EOA delegation | `SignerEIP7702` |
| P256 | Passkeys, HSMs | `SignerP256` |
| RSA | PKI systems | `SignerRSA` |
| WebAuthn | Web Authentication | `SignerWebAuthn` |
| Multisig | Multiple signers | `SignerERC7913` |
| Weighted Multisig | Weighted voting | `SignerERC7913Weighted` |

### ECDSA Signer

Standard Ethereum signatures:

```solidity
import {SignerECDSA} from "@openzeppelin/contracts/account/extensions/SignerECDSA.sol";

contract MyAccount is Account, SignerECDSA {
    constructor(address signer) SignerECDSA(signer) {}
}
```

### P256 Signer (Passkeys)

For WebAuthn/Passkey integration:

```solidity
import {SignerP256} from "@openzeppelin/contracts/account/extensions/SignerP256.sol";

contract MyAccount is Account, SignerP256 {
    constructor(bytes32 qx, bytes32 qy) SignerP256(qx, qy) {}
}
```

### WebAuthn Signer

Full WebAuthn assertion validation:

```solidity
import {SignerWebAuthn} from "@openzeppelin/contracts/account/extensions/SignerWebAuthn.sol";

contract MyAccount is Account, SignerWebAuthn {
    constructor(bytes32 qx, bytes32 qy) SignerWebAuthn(qx, qy) {}
}
```

### Multisig Signer

Require multiple signatures:

```solidity
import {SignerERC7913} from "@openzeppelin/contracts/account/extensions/SignerERC7913.sol";

contract MyAccount is Account, SignerERC7913 {
    constructor(bytes[] memory signers, uint256 threshold)
        SignerERC7913(signers, threshold)
    {}
}
```

### Weighted Multisig

Different voting weights per signer:

```solidity
import {SignerERC7913Weighted} from "@openzeppelin/contracts/account/extensions/SignerERC7913Weighted.sol";

contract MyAccount is Account, SignerERC7913Weighted {
    constructor(
        bytes[] memory signers,
        uint256[] memory weights,
        uint256 threshold
    )
        SignerERC7913Weighted(signers, weights, threshold)
    {}
}
```

### EIP-7702 Signer

For EOA delegation (account's own address as signer):

```solidity
import {SignerEIP7702} from "@openzeppelin/contracts/account/extensions/SignerEIP7702.sol";

contract MyAccount is Account, SignerEIP7702 {
    // Uses account address as signer
}
```

---

## Token Receivers

Enable account to receive tokens:

### ERC721 Receiver

```solidity
import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract MyAccount is Account, SignerECDSA, ERC721Holder {
    constructor(address signer) SignerECDSA(signer) {}
}
```

### ERC1155 Receiver

```solidity
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract MyAccount is Account, SignerECDSA, ERC1155Holder {
    constructor(address signer) SignerECDSA(signer) {}

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Account, ERC1155Holder)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

### ERC-1271 Signature Validation

Allow contract to validate signatures (for other contracts to verify):

```solidity
import {ERC1271} from "@openzeppelin/contracts/account/extensions/ERC1271.sol";

contract MyAccount is Account, SignerECDSA, ERC1271 {
    constructor(address signer) SignerECDSA(signer) {}
}
```

---

## Modules (ERC-7579)

Enable modular account functionality:

```solidity
import {AccountERC7579} from "@openzeppelin/contracts/account/extensions/AccountERC7579.sol";

contract MyAccount is Account, SignerECDSA, AccountERC7579 {
    constructor(address signer) SignerECDSA(signer) {}

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Account, AccountERC7579)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

### Module Types

| Type | Purpose |
|------|---------|
| Validator | Custom signature validation |
| Executor | Custom execution logic |
| Fallback | Handle unknown function calls |

---

## Batched Execution (ERC-7821)

Execute multiple operations in one transaction:

```solidity
import {ERC7821} from "@openzeppelin/contracts/account/extensions/ERC7821.sol";

contract MyAccount is Account, SignerECDSA, ERC7821 {
    constructor(address signer) SignerECDSA(signer) {}
}
```

### Usage

```solidity
// Batch structure
struct Call {
    address target;
    uint256 value;
    bytes data;
}

// Execute batch
account.execute(calls);
```

---

## Complete Example

### Full-Featured Account

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Account} from "@openzeppelin/contracts/account/Account.sol";
import {ERC1271} from "@openzeppelin/contracts/account/extensions/ERC1271.sol";
import {ERC7821} from "@openzeppelin/contracts/account/extensions/ERC7821.sol";
import {AccountERC7579} from "@openzeppelin/contracts/account/extensions/AccountERC7579.sol";
import {SignerECDSA} from "@openzeppelin/contracts/account/extensions/SignerECDSA.sol";
import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract MyAccount is
    Account,
    ERC1271,
    ERC7821,
    AccountERC7579,
    SignerECDSA,
    ERC721Holder,
    ERC1155Holder
{
    constructor(address signer) SignerECDSA(signer) {}

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Account, AccountERC7579, ERC1155Holder)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

### Upgradeable Account

```solidity
import {AccountUpgradeable} from "@openzeppelin/contracts-upgradeable/account/AccountUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {SignerECDSAUpgradeable} from "@openzeppelin/contracts-upgradeable/account/extensions/SignerECDSAUpgradeable.sol";

contract MyAccountV1 is
    Initializable,
    AccountUpgradeable,
    SignerECDSAUpgradeable,
    UUPSUpgradeable
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address signer) initializer public {
        __Account_init();
        __SignerECDSA_init(signer);
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyEntryPointOrSelf
        override
    {}
}
```

---

## EntryPoint Interaction

### Validation

Account must implement `validateUserOp`:

```solidity
function validateUserOp(
    PackedUserOperation calldata userOp,
    bytes32 userOpHash,
    uint256 missingAccountFunds
) external returns (uint256 validationData);
```

The base `Account` contract handles this, delegating to your signer.

### Execution

Operations are executed via:
- `execute()` - Single operation
- `executeBatch()` - Multiple operations (with ERC7821)

### Entry Point Address

The canonical EntryPoint is at:
```
0x0000000071727De22E5E9d8BAf0edAc6f37da032
```

Verify on deployment target chain.
