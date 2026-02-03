# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenZeppelin Contracts Wizard - a web application and programmatic API for generating smart contracts. Supports multiple blockchain languages: Solidity, Cairo, Stellar Soroban, Arbitrum Stylus, and Uniswap v4 Hooks.

## Essential Commands

```bash
# Setup
yarn install

# Development (runs UI on :8080 and Deno API on :3000)
yarn dev
yarn dev:ui        # UI only
yarn dev:api       # API only (requires Deno 1.46.3)

# Testing specific language packages
yarn run:core solidity test
yarn run:core cairo test
yarn run:core stellar test
yarn run:core stylus test
yarn run:core uniswap-hooks test

# Run a single test file
npx ava packages/core/solidity/src/erc20.test.ts

# UI and MCP tests
yarn test:ui
cd packages/mcp && yarn test

# Linting and formatting
yarn lint
yarn lint --fix
yarn format:check
yarn format:write

# Build
yarn run build
```

## Architecture

```
packages/
├── common/           # Shared utilities and AI descriptions
├── core/
│   ├── solidity/     # @openzeppelin/wizard (NPM package)
│   ├── cairo/        # @openzeppelin/wizard-cairo
│   ├── stellar/      # @openzeppelin/wizard-stellar
│   ├── stylus/       # @openzeppelin/wizard-stylus
│   └── uniswap-hooks/# @openzeppelin/wizard-uniswap-hooks
├── mcp/              # MCP Server for AI tool integration
└── ui/               # Svelte web application
```

### Core Package Pattern

Each core language package (solidity, cairo, stellar, stylus, uniswap-hooks) follows the same structure:
- Contract type modules (e.g., `erc20.ts`, `erc721.ts`, `governor.ts`)
- Each module exports: `print()`, `defaults`, `isAccessControlRequired()`
- The `print()` function generates contract source code from options
- `*.test.ts` files for unit tests, `*.snap` for snapshot tests

### UI Structure

The UI (`packages/ui/src/`) has language-specific apps that share common components:
- Each language has its own `App.svelte` in subdirectories (solidity/, cairo/, stellar/, etc.)
- Components in the root share functionality across languages
- The main entry point is determined by build configuration

### API Server

Deno-based backend (`api/`) provides:
- AI Assistant integration using OpenAI
- Redis caching for chat sessions
- Endpoints at `/api/ai/*`

## Key Patterns

**Contract Generation Flow:**
Options object → `print()` function → Contract source code string

**Adding a new contract type:**
1. Create the options interface and defaults in `packages/core/{language}/`
2. Implement `print()` function using the common patterns
3. Add tests and snapshots
4. Add UI controls in `packages/ui/src/{language}/`

## Testing Notes

- AVA is the test framework with 10-minute timeout
- Snapshot tests: Run `npx ava --update-snapshots` to update
- Solidity compile tests require Foundry (`forge`)
- Stellar compile tests require Rust toolchain

## PR Requirements

- PRs modifying packages must include changesets: `yarn changeset`
- All checks must pass: lint, format, tests
