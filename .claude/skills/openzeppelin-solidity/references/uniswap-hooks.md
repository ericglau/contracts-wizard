# Uniswap v4 Hooks

## Table of Contents

1. [Overview](#overview)
2. [Hook Types](#hook-types)
3. [Permissions](#permissions)
4. [Shares](#shares)
5. [Examples](#examples)

---

## Overview

Uniswap v4 hooks allow custom logic at key pool lifecycle points.

```
Pool Operation
    ↓
Hook.beforeX()
    ↓
Core Pool Logic
    ↓
Hook.afterX()
```

### Installation

```bash
npm install @openzeppelin/uniswap-hooks
```

---

## Hook Types

### Base Hooks

| Hook | Description | Use Case |
|------|-------------|----------|
| `BaseHook` | Minimal hook | Custom logic at any point |
| `BaseAsyncSwap` | Async swap execution | Batching, reordering |
| `BaseCustomAccounting` | Custom accounting | Liquidity mining, LP rewards |
| `BaseCustomCurve` | Custom pricing | Specialized AMM curves |

### Fee Hooks

| Hook | Description |
|------|-------------|
| `BaseDynamicFee` | Dynamic LP fee per pool |
| `BaseOverrideFee` | Dynamic fee per swap |
| `BaseDynamicAfterFee` | Target-based fee capture |
| `BaseHookFee` | Hook-owned fee collection |

### Specialized Hooks

| Hook | Description |
|------|-------------|
| `AntiSandwichHook` | MEV protection via penalties |
| `ReHypothecationHook` | Liquidity yield farming |
| `LiquidityPenaltyHook` | JIT liquidity protection |
| `LimitOrderHook` | On-chain limit orders |
| `BaseOracleHook` | Price oracle integration |
| `OracleHookWithV3Adapters` | V3-compatible oracle |

---

## Basic Hook

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {BaseHook} from "@openzeppelin/uniswap-hooks/base/BaseHook.sol";
import {IPoolManager} from "@uniswap/v4-core/contracts/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/contracts/libraries/Hooks.sol";

contract MyHook is BaseHook {
    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {}

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterAddLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,
            afterSwap: false,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    function _beforeSwap(
        address sender,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        bytes calldata hookData
    ) internal override returns (bytes4, BeforeSwapDelta, uint24) {
        // Custom logic here
        return (this._beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }
}
```

---

## Permissions

### Permission Flags

| Permission | Description |
|------------|-------------|
| `beforeInitialize` | Called before pool initialization |
| `afterInitialize` | Called after pool initialization |
| `beforeAddLiquidity` | Called before adding liquidity |
| `afterAddLiquidity` | Called after adding liquidity |
| `beforeRemoveLiquidity` | Called before removing liquidity |
| `afterRemoveLiquidity` | Called after removing liquidity |
| `beforeSwap` | Called before swap execution |
| `afterSwap` | Called after swap execution |
| `beforeDonate` | Called before donations |
| `afterDonate` | Called after donations |

### Return Delta Permissions

| Permission | Description |
|------------|-------------|
| `beforeSwapReturnDelta` | Modify swap amounts before |
| `afterSwapReturnDelta` | Capture value after swap |
| `afterAddLiquidityReturnDelta` | Modify liquidity add results |
| `afterRemoveLiquidityReturnDelta` | Modify liquidity remove results |

### Dependencies

Some permissions require others:
- `beforeSwapReturnDelta` requires `beforeSwap`
- `afterSwapReturnDelta` requires `afterSwap`
- `afterAddLiquidityReturnDelta` requires `afterAddLiquidity`
- `afterRemoveLiquidityReturnDelta` requires `afterRemoveLiquidity`

---

## Shares

Hooks can issue shares to track LP positions:

### Share Types

| Type | Standard | Use Case |
|------|----------|----------|
| ERC20 | Fungible | Single pool, fungible LP |
| ERC6909 | Multi-token | Multiple pools, gas efficient |
| ERC1155 | Multi-token | Multiple pools, metadata |

### ERC20 Shares

```solidity
import {BaseCustomAccounting} from "@openzeppelin/uniswap-hooks/base/BaseCustomAccounting.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyHook is BaseCustomAccounting, ERC20 {
    constructor(IPoolManager _poolManager)
        BaseCustomAccounting(_poolManager)
        ERC20("LP Shares", "LPS")
    {}

    function _mint(address to, uint256 amount) internal override {
        ERC20._mint(to, amount);
    }

    function _burn(address from, uint256 amount) internal override {
        ERC20._burn(from, amount);
    }
}
```

### Hook-Specific Requirements

| Hook | Shares |
|------|--------|
| BaseHook | Optional |
| BaseCustomAccounting | Required |
| BaseCustomCurve | Required |
| LimitOrderHook | ERC6909 required |
| Others | Disabled |

---

## Examples

### Dynamic Fee Hook

```solidity
import {BaseDynamicFee} from "@openzeppelin/uniswap-hooks/fees/BaseDynamicFee.sol";

contract VolatilityFeeHook is BaseDynamicFee {
    constructor(IPoolManager _poolManager) BaseDynamicFee(_poolManager) {}

    function _getFee(
        address sender,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        bytes calldata hookData
    ) internal view override returns (uint24) {
        // Return fee based on volatility or other factors
        // Fee is in hundredths of a bip (1 = 0.0001%)
        return 3000; // 0.3%
    }

    function poke(PoolKey calldata key) external onlyRole(POKE_ROLE) {
        _poke(key);
    }
}
```

### Anti-Sandwich Hook

```solidity
import {AntiSandwichHook} from "@openzeppelin/uniswap-hooks/security/AntiSandwichHook.sol";

contract MyAntiSandwich is AntiSandwichHook {
    constructor(IPoolManager _poolManager) AntiSandwichHook(_poolManager) {}

    function _afterSwapHandler(
        address sender,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) internal override {
        // Distribute penalty fees to honest LPs
        // Or improve swap pricing
    }
}
```

### Custom Curve Hook

```solidity
import {BaseCustomCurve} from "@openzeppelin/uniswap-hooks/base/BaseCustomCurve.sol";

contract StableCurveHook is BaseCustomCurve {
    constructor(IPoolManager _poolManager) BaseCustomCurve(_poolManager) {}

    function _getUnspecifiedAmount(
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        uint256 specifiedAmount
    ) internal view override returns (uint256) {
        // Implement stable swap curve math
    }

    function _getSwapFeeAmount(
        PoolKey calldata key,
        uint256 unspecifiedAmount
    ) internal view override returns (uint256) {
        // Calculate LP fees
    }

    function _getAmountOut(/* ... */) internal view override returns (uint256) {
        // Calculate output amount
    }

    function _getAmountIn(/* ... */) internal view override returns (uint256) {
        // Calculate input amount
    }

    function _mint(address to, uint256 amount) internal override {
        // Mint shares
    }

    function _burn(address from, uint256 amount) internal override {
        // Burn shares
    }
}
```

### Oracle Hook

```solidity
import {BaseOracleHook} from "@openzeppelin/uniswap-hooks/oracles/panoptic/BaseOracleHook.sol";

contract MyOracle is BaseOracleHook {
    constructor(IPoolManager _poolManager, int24 maxAbsTickDelta)
        BaseOracleHook(_poolManager, maxAbsTickDelta)
    {}
}
```

Parameters:
- `maxAbsTickDelta`: Maximum tick change per observation (0-887272)
  - `488` = ~5% max price change per observation
  - `887272` = No truncation (full range)

---

## Pausable Hooks

Add pausability to protect against exploits:

```solidity
import {BaseHook} from "@openzeppelin/uniswap-hooks/base/BaseHook.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract PausableHook is BaseHook, Pausable, Ownable {
    constructor(IPoolManager _poolManager, address owner)
        BaseHook(_poolManager)
        Ownable(owner)
    {}

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _beforeSwap(/* ... */)
        internal
        override
        whenNotPaused
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        // Hook logic
    }
}
```

Pausable automatically enables required `before*` permissions.

---

## Utilities

### CurrencySettler

Handle token settlements:

```solidity
import {CurrencySettler} from "@openzeppelin/uniswap-hooks/utils/CurrencySettler.sol";

using CurrencySettler for Currency;

currency.settle(poolManager, payer, amount, burn);
currency.take(poolManager, recipient, amount, mint);
```

### SafeCast

Safe integer casting:

```solidity
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";

using SafeCast for *;

int256 signedAmount = unsignedAmount.toInt256();
```

### TransientSlot

Efficient transient storage:

```solidity
import {TransientSlot} from "@openzeppelin/contracts/utils/TransientSlot.sol";
import {SlotDerivation} from "@openzeppelin/contracts/utils/SlotDerivation.sol";

using TransientSlot for bytes32;
using SlotDerivation for bytes32;
```
