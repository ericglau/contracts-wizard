# Solidity Governance

## Table of Contents

1. [Overview](#overview)
2. [Governor Contract](#governor-contract)
3. [Voting Tokens](#voting-tokens)
4. [Timelock](#timelock)
5. [Configuration Options](#configuration-options)
6. [Complete Example](#complete-example)

---

## Overview

Governance system components:

```
Voting Token (ERC20Votes/ERC721Votes)
    ↓ delegates votes to
Governor Contract
    ↓ queues proposals to
Timelock Controller
    ↓ executes on
Target Contracts
```

---

## Governor Contract

### Basic Governor

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Governor} from "@openzeppelin/contracts/governance/Governor.sol";
import {GovernorSettings} from "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import {GovernorCountingSimple} from "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import {GovernorVotes} from "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import {GovernorVotesQuorumFraction} from "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

contract MyGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction
{
    constructor(IVotes _token)
        Governor("MyGovernor")
        GovernorSettings(
            7200,   /* voting delay: 1 day */
            50400,  /* voting period: 1 week */
            0       /* proposal threshold */
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) /* 4% quorum */
    {}

    // Required overrides
    function votingDelay()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }
}
```

### Available Extensions

| Extension | Description |
|-----------|-------------|
| `GovernorSettings` | Configurable delay, period, threshold |
| `GovernorCountingSimple` | For, Against, Abstain voting |
| `GovernorVotes` | Token-based voting power |
| `GovernorVotesQuorumFraction` | Percentage-based quorum |
| `GovernorTimelockControl` | Timelock integration |
| `GovernorStorage` | On-chain proposal storage |
| `GovernorPreventLateQuorum` | Extend voting if quorum reached late |

---

## Voting Tokens

### ERC20 Voting Token

```solidity
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

contract MyVoteToken is ERC20, ERC20Permit, ERC20Votes {
    constructor() ERC20("MyVoteToken", "MVT") ERC20Permit("MyVoteToken") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

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

### ERC721 Voting Token

```solidity
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Votes} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Votes.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract MyVoteNFT is ERC721, EIP712, ERC721Votes {
    constructor()
        ERC721("MyVoteNFT", "MVNFT")
        EIP712("MyVoteNFT", "1")
    {}

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Votes)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 amount)
        internal
        override(ERC721, ERC721Votes)
    {
        super._increaseBalance(account, amount);
    }
}
```

### Clock Mode

Voting tokens can use block numbers or timestamps:

```solidity
// Timestamp mode
function clock() public view override returns (uint48) {
    return uint48(block.timestamp);
}

function CLOCK_MODE() public pure override returns (string memory) {
    return "mode=timestamp";
}
```

Governor must match the token's clock mode.

---

## Timelock

### TimelockController

```solidity
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";

// Deploy with:
// - minDelay: 1 day (in seconds)
// - proposers: [governor address]
// - executors: [address(0)] for anyone
// - admin: address(0) to renounce

TimelockController timelock = new TimelockController(
    1 days,           // minDelay
    proposers,        // proposer addresses
    executors,        // executor addresses
    address(0)        // admin (renounced)
);
```

### Governor with Timelock

```solidity
import {GovernorTimelockControl} from "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

contract MyGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    constructor(IVotes _token, TimelockController _timelock)
        Governor("MyGovernor")
        GovernorSettings(7200, 50400, 0)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4)
        GovernorTimelockControl(_timelock)
    {}

    // Additional overrides for timelock
    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function proposalNeedsQueuing(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.proposalNeedsQueuing(proposalId);
    }

    function _queueOperations(/* ... */)
        internal
        override(Governor, GovernorTimelockControl)
        returns (uint48)
    {
        return super._queueOperations(/* ... */);
    }

    function _executeOperations(/* ... */)
        internal
        override(Governor, GovernorTimelockControl)
    {
        super._executeOperations(/* ... */);
    }

    function _cancel(/* ... */)
        internal
        override(Governor, GovernorTimelockControl)
        returns (uint256)
    {
        return super._cancel(/* ... */);
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }
}
```

---

## Configuration Options

### Voting Delay

Time between proposal creation and voting start:

```solidity
// In blocks (default)
GovernorSettings(7200, ..., ...)  // ~1 day at 12s/block

// In seconds (timestamp mode)
GovernorSettings(86400, ..., ...)  // 1 day
```

### Voting Period

Duration of voting window:

```solidity
// In blocks
GovernorSettings(..., 50400, ...)  // ~1 week at 12s/block

// In seconds
GovernorSettings(..., 604800, ...)  // 1 week
```

### Proposal Threshold

Minimum votes to create proposal:

```solidity
GovernorSettings(..., ..., 1000e18)  // 1000 tokens
GovernorSettings(..., ..., 0)        // Anyone can propose
```

### Quorum

#### Percentage-Based

```solidity
GovernorVotesQuorumFraction(4)  // 4% of total supply
```

#### Absolute

```solidity
import {GovernorVotes} from "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";

contract MyGovernor is Governor, GovernorVotes {
    uint256 private _quorum;

    constructor(IVotes _token, uint256 quorumValue)
        Governor("MyGovernor")
        GovernorVotes(_token)
    {
        _quorum = quorumValue;
    }

    function quorum(uint256) public view override returns (uint256) {
        return _quorum;
    }
}
```

---

## Complete Example

### Full Governance System

```solidity
// 1. Voting Token
contract GovernanceToken is ERC20, ERC20Permit, ERC20Votes {
    constructor() ERC20("Governance Token", "GOV") ERC20Permit("Governance Token") {
        _mint(msg.sender, 10000000 * 10 ** decimals());
    }

    function _update(address from, address to, uint256 value)
        internal override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public view override(ERC20Permit, Nonces) returns (uint256)
    {
        return super.nonces(owner);
    }
}

// 2. Governor
contract MyGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    constructor(IVotes _token, TimelockController _timelock)
        Governor("MyGovernor")
        GovernorSettings(7200, 50400, 0)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4)
        GovernorTimelockControl(_timelock)
    {}

    // ... all required overrides
}

// 3. Deployment Script
function deploy() {
    // Deploy token
    GovernanceToken token = new GovernanceToken();

    // Deploy timelock (governor will be added as proposer)
    address[] memory proposers = new address[](0);
    address[] memory executors = new address[](1);
    executors[0] = address(0); // Anyone can execute

    TimelockController timelock = new TimelockController(
        1 days,
        proposers,
        executors,
        msg.sender // Temporary admin
    );

    // Deploy governor
    MyGovernor governor = new MyGovernor(token, timelock);

    // Configure timelock
    timelock.grantRole(timelock.PROPOSER_ROLE(), address(governor));
    timelock.grantRole(timelock.CANCELLER_ROLE(), address(governor));
    timelock.renounceRole(timelock.DEFAULT_ADMIN_ROLE(), msg.sender);
}
```

### Proposal Lifecycle

```
1. Create Proposal
   governor.propose(targets, values, calldatas, description)

2. Wait for Voting Delay

3. Vote
   governor.castVote(proposalId, support)
   // support: 0=Against, 1=For, 2=Abstain

4. Wait for Voting Period to End

5. Queue (if using timelock)
   governor.queue(targets, values, calldatas, descriptionHash)

6. Wait for Timelock Delay

7. Execute
   governor.execute(targets, values, calldatas, descriptionHash)
```
