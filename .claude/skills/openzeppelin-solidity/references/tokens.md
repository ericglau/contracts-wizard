# Solidity Token Standards

## Table of Contents

1. [ERC20 Fungible Tokens](#erc20-fungible-tokens)
2. [ERC721 Non-Fungible Tokens](#erc721-non-fungible-tokens)
3. [ERC1155 Multi-Tokens](#erc1155-multi-tokens)
4. [Stablecoin Tokens](#stablecoin-tokens)

---

## ERC20 Fungible Tokens

### Basic ERC20

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract MyToken is ERC20, ERC20Permit {
    constructor() ERC20("MyToken", "MTK") ERC20Permit("MyToken") {}
}
```

### Available Features

| Feature | Import | Description |
|---------|--------|-------------|
| Burnable | `ERC20Burnable` | Holders can destroy tokens |
| Pausable | `ERC20Pausable` | Privileged pause of transfers |
| Mintable | (function) | Privileged token creation |
| Permit | `ERC20Permit` | Gasless approvals via signatures |
| Votes | `ERC20Votes` | Governance voting power tracking |
| Flash Mint | `ERC20FlashMint` | Collateral-free flash loans |
| Capped | `ERC20Capped` | Maximum supply limit |
| Callback | `ERC1363` | Execute code after transfers |

### Feature Dependencies

```
Votes ──requires──> Permit (auto-enabled)
Pausable ──requires──> Access Control
Mintable ──requires──> Access Control
```

### ERC20 with Premint

```solidity
contract MyToken is ERC20, ERC20Permit {
    constructor(address recipient) ERC20("MyToken", "MTK") ERC20Permit("MyToken") {
        _mint(recipient, 1000000 * 10 ** decimals());
    }
}
```

### ERC20 Mintable + Pausable

```solidity
contract MyToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ERC20Permit {
    constructor(address initialOwner)
        ERC20("MyToken", "MTK")
        Ownable(initialOwner)
        ERC20Permit("MyToken")
    {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Required override when using ERC20Pausable
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}
```

### ERC20 with Votes

```solidity
contract MyToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    constructor(address initialOwner)
        ERC20("MyToken", "MTK")
        Ownable(initialOwner)
        ERC20Permit("MyToken")
    {}

    // Required overrides for Votes
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
```

### Clock Mode Options

For Votes, choose timestamp or block number:

```solidity
// Block number (default)
contract MyToken is ERC20, ERC20Permit, ERC20Votes {
    // Uses block.number for checkpoints
}

// Timestamp
contract MyToken is ERC20, ERC20Permit, ERC20Votes {
    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
    }

    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=timestamp";
    }
}
```

### Cross-Chain Bridging

```solidity
contract MyToken is ERC20, ERC20Permit, ERC20Bridgeable, Ownable {
    constructor(address initialOwner, address tokenBridge)
        ERC20("MyToken", "MTK")
        Ownable(initialOwner)
        ERC20Permit("MyToken")
    {
        _setTokenBridge(tokenBridge);
    }
}
```

For Superchain (OP Stack):
```solidity
contract MyToken is ERC20, ERC20Permit, SuperchainERC20 {
    constructor() ERC20("MyToken", "MTK") ERC20Permit("MyToken") {}
}
```

---

## ERC721 Non-Fungible Tokens

### Basic ERC721

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyNFT is ERC721 {
    constructor() ERC721("MyNFT", "MNFT") {}
}
```

### Available Features

| Feature | Import | Description |
|---------|--------|-------------|
| Burnable | `ERC721Burnable` | Holders can destroy tokens |
| Pausable | `ERC721Pausable` | Privileged pause of transfers |
| Enumerable | `ERC721Enumerable` | On-chain token enumeration |
| URI Storage | `ERC721URIStorage` | Per-token metadata URIs |
| Votes | `ERC721Votes` | Governance voting power |
| Royalties | `ERC2981` | NFT royalty standard |
| Consecutive | `ERC721Consecutive` | Batch minting (ERC-2309) |

### ERC721 with Auto-Increment IDs

```solidity
contract MyNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor(address initialOwner)
        ERC721("MyNFT", "MNFT")
        Ownable(initialOwner)
    {}

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // Required overrides
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

### ERC721 with Royalties

```solidity
contract MyNFT is ERC721, ERC2981, Ownable {
    constructor(address initialOwner, address royaltyReceiver)
        ERC721("MyNFT", "MNFT")
        Ownable(initialOwner)
    {
        // 5% royalty (500 basis points)
        _setDefaultRoyalty(royaltyReceiver, 500);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

---

## ERC1155 Multi-Tokens

### Basic ERC1155

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract MyMultiToken is ERC1155 {
    constructor() ERC1155("https://example.com/api/{id}.json") {}
}
```

### Available Features

| Feature | Import | Description |
|---------|--------|-------------|
| Burnable | `ERC1155Burnable` | Holders can destroy tokens |
| Pausable | `ERC1155Pausable` | Privileged pause of transfers |
| Supply | `ERC1155Supply` | Track total supply per token ID |
| URI Storage | (custom) | Updatable metadata URIs |

### ERC1155 with Supply Tracking

```solidity
contract MyMultiToken is ERC1155, ERC1155Burnable, ERC1155Pausable, ERC1155Supply, Ownable {
    constructor(address initialOwner)
        ERC1155("https://example.com/api/{id}.json")
        Ownable(initialOwner)
    {}

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }

    // Required overrides
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Pausable, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }
}
```

---

## Stablecoin Tokens

### Basic Stablecoin

Stablecoins extend ERC20 with additional compliance features:

```solidity
contract MyStablecoin is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ERC20Permit {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant FREEZER_ROLE = keccak256("FREEZER_ROLE");

    mapping(address => bool) private _frozen;

    constructor(address defaultAdmin, address minter, address pauser)
        ERC20("MyStablecoin", "MUSD")
        ERC20Permit("MyStablecoin")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, minter);
        _grantRole(PAUSER_ROLE, pauser);
    }

    function freeze(address account) public onlyRole(FREEZER_ROLE) {
        _frozen[account] = true;
    }

    function unfreeze(address account) public onlyRole(FREEZER_ROLE) {
        _frozen[account] = false;
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        require(!_frozen[from], "Sender frozen");
        require(!_frozen[to], "Recipient frozen");
        super._update(from, to, value);
    }
}
```

### Stablecoin Features

| Feature | Description |
|---------|-------------|
| Freezable | Freeze/unfreeze accounts for compliance |
| Allowlist | Only approved addresses can hold/transfer |
| Blocklist | Block specific addresses |
| Force Transfer | Admin can move tokens between accounts |
| Clawback | Admin can burn tokens from accounts |
