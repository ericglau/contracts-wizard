---
'@openzeppelin/wizard': patch
---

Add a "Hardhat project · viem" development package download alongside the existing Hardhat option.
- Rename the existing Hardhat download label to "Hardhat project · ethers.js".
- Generated viem projects use `@nomicfoundation/hardhat-viem` (and Ignition viem for non-upgradeable contracts) or `@openzeppelin/hardhat-upgrades/viem` for upgradeable contracts.
