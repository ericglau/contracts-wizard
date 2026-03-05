# Product Proposal: CLI for Contract Generation

## Why

AI coding agents that use our [Skills](https://github.com/OpenZeppelin/openzeppelin-skills) for smart contract development have a specific workflow: **generate-compare-apply**. The agent generates a baseline contract, generates a variant with a feature enabled, diffs the two, and applies the relevant changes to the user's existing code.

Today this workflow uses MCP tools. The problem is that MCP tool responses always land in the agent's context window. For the diff workflow, that means two full contract sources sitting in context simultaneously — potentially 400+ lines for complex contracts like Governor or Stablecoin — when the agent only needs the 10-20 lines that changed.

A CLI that writes to stdout lets agents pipe output directly to files and diff them on disk. Only the compact diff enters the context window. This is a meaningful reduction in token usage per interaction.

For new contract generation (not the diff workflow), the CLI offers no context advantage — the agent will read the generated source regardless. But it still has a practical advantage: **zero setup overhead**. The CLI is runnable via `npx` with no pre-installation, while MCP requires configuring the server in each client. The hosted MCP (mcp.openzeppelin.com) solves setup for remote agents that don't have a local environment, but local agents with shell access can just run the CLI directly.

## What

A new npm package, `@openzeppelin/contracts-cli`, providing a command-line interface to the same contract generators that power the MCP server.

```bash
npx @openzeppelin/contracts-cli solidity-erc20 --name MyToken --symbol MTK --mintable --pausable
```

The CLI outputs raw contract source to stdout — no markdown wrapping, no protocol overhead. Agents (or humans) can pipe it to files, diff it, or consume it however they want.

### Naming

The name follows the existing convention where `contracts-*` packages cover all supported languages and ecosystems:

| Package | Scope | Audience |
|---|---|---|
| `@openzeppelin/wizard` | Solidity core lib | Developers, internal |
| `@openzeppelin/wizard-cairo` | Cairo core lib | Developers, internal |
| `@openzeppelin/contracts-mcp` | All languages, MCP server | Agents, IDE users |
| **`@openzeppelin/contracts-cli`** | **All languages, CLI** | **Agents, developers, scripts** |

It's a separate package from `contracts-mcp` so that CLI users don't need to install the MCP SDK, and MCP users don't need the CLI argument parser. Each package includes only what its audience needs.

## How (High Level)

The implementation is nearly effortless because the code infrastructure already exists.

Each contract generator already has a **typed schema** defining every parameter it accepts — name, type, allowed values, and a human-readable description. These schemas power the MCP tools today, but they're not MCP-specific. They're generic definitions of what each generator supports.

The CLI will reuse the same schemas to parse command-line flags, generate `--help` output, and validate input. No duplication — one source of truth for both interfaces. When a new contract type or option is added to the generators, the CLI will pick it up automatically through the shared schema.

## Scope

The CLI will cover all contract types across all Wizard-supported languages and ecosystems — the same generators the MCP server provides. Each generator will be a single CLI command (e.g., `solidity-erc20`, `cairo-governor`, `stellar-fungible`) with options auto-derived from its schema.
