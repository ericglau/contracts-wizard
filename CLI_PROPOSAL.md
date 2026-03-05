# Proposal: CLI Mode for Contract Generation

## Motivation

The primary motivation is the **generate-compare-apply workflow** described in [OpenZeppelin Skills](https://github.com/OpenZeppelin/openzeppelin-skills) for pattern discovery. Agents generate a baseline and a feature variant to diff them. With MCP, both full contract sources land in the context window. With a CLI piping to files, only the compact diff enters context — a meaningful token saving for complex contracts like Governor or Stablecoin.

For new contract generation, the CLI offers no meaningful advantage over MCP — the agent will read the generated source into context regardless (to review, modify, or integrate it), so the token cost is the same either way.

## Packaging & Naming

A separate `@openzeppelin/contracts-cli` package for the CLI. This avoids forcing CLI users to install `@modelcontextprotocol/sdk`, which they never use.

```bash
npx @openzeppelin/contracts-cli solidity-erc20 --name MyToken --mintable
```

The naming parallels the existing ecosystem:
- `@openzeppelin/wizard` — Solidity core lib
- `@openzeppelin/wizard-cairo` — Cairo core lib
- `@openzeppelin/contracts-cli` — all-language CLI (user and agent facing)
- `@openzeppelin/contracts-mcp` — all-language MCP server (agent-facing)

## Design Principle: Near-Zero Maintenance

The Zod schemas currently live in `packages/mcp/src/*/schemas.ts`, but they have nothing MCP-specific about them. They combine:
- Type definitions (string, boolean, enum unions) mirroring the core `*Options` interfaces
- Description strings from `@openzeppelin/wizard-common`
- Validation via Zod

Both MCP and CLI need these schemas. Neither should own them.

### Move schemas to `@openzeppelin/wizard-common`

```
packages/common/src/
├── ai/descriptions/     ← exists (plain strings, no imports)
├── ai/schemas/          ← NEW (Zod schemas using those strings)
│   ├── solidity.ts
│   ├── cairo.ts
│   ├── stellar.ts
│   ├── stylus.ts
│   ├── confidential.ts
│   └── uniswap-hooks.ts
```

The existing description files have a "no imports" constraint because the package is consumed by both Node (e.g., the MCP package) and Deno (the AI assistant code in the UI package, which runs as a Netlify edge function). Node and Deno have different requirements for file extensions in import statements, so the description files avoid imports entirely. The schemas depend on Zod and are only consumed by Node packages (MCP and CLI), so they use a separate export path:

```jsonc
// packages/common/package.json
{
  "exports": {
    ".": "./dist/index.js",
    "./schemas": "./dist/ai/schemas/index.js"
  }
}
```

Consumers that need Deno compat import from `@openzeppelin/wizard-common`. Those that need schemas import from `@openzeppelin/wizard-common/schemas`. Zod stays out of the base entry point.

### Resulting dependency graph

```
@openzeppelin/wizard-common              ← descriptions + Zod schemas
@openzeppelin/wizard + wizard-cairo + ...  ← core print functions
        ↑                       ↑
@openzeppelin/contracts-cli          @openzeppelin/contracts-mcp
(cli-adapter, argv parsing)             (MCP SDK, tool registration)
No MCP SDK dependency                   No CLI dependency
```

Neither package depends on the other. Both are thin wrappers over common + core.

## Architecture

```
packages/common/src/ai/schemas/      ← Zod schemas (moved from packages/mcp)
packages/cli/                 ← NEW package
├── src/
│   ├── index.ts                     ← CLI entry point
│   ├── cli-adapter.ts               ← Zod schema → util.parseArgs conversion
│   └── registry.ts                  ← command → {schema, print} mapping
├── package.json
packages/mcp/
├── src/
│   ├── cli.ts                       ← MCP stdio entry (unchanged)
│   ├── solidity/
│   │   ├── tools/                   ← MCP tool handlers (import schemas from common)
│   │   └── (schemas.ts removed — moved to common)
│   └── ...
```

### `cli-adapter.ts` — The Only New Abstraction

A single generic function that converts a Zod object schema into parsed CLI arguments:

```ts
import { z } from 'zod';

/**
 * Converts a Zod schema's shape into CLI flag definitions and parses process.argv against them.
 *
 * - z.string()            → --flag <value>
 * - z.boolean()           → --flag (presence = true), --flag true|false
 * - z.literal('a').or(z.literal('b')) → --flag <a|b>
 * - .optional()           → flag is not required
 * - .describe(text)       → used as --help description
 * - z.object() (nested)   → --parent.key <value> (for the `info` field)
 */
export function parseArgsFromSchema<T extends z.ZodRawShape>(
  schema: T,
  argv: string[],
): z.infer<z.ZodObject<T>> { ... }
```

Uses `z.ZodFirstPartyTypeKind` introspection on each schema field to determine CLI flag type. Uses Node's built-in `util.parseArgs` (Node 18.3+) — no external CLI framework dependency.

`--help` output is auto-generated from the `.describe()` strings already present on every schema field.

### `index.ts` — CLI Entry Point

```ts
#!/usr/bin/env node
import { parseArgsFromSchema } from './cli-adapter';
import { erc20Schema, erc721Schema, /* ... */ } from '@openzeppelin/wizard-common/schemas';
import { erc20, erc721, /* ... */ } from '@openzeppelin/wizard';

const registry = {
  'solidity-erc20':  { schema: erc20Schema,  print: (opts) => erc20.print(opts) },
  'solidity-erc721': { schema: erc721Schema, print: (opts) => erc721.print(opts) },
  // ... one entry per language+kind
};

const [command] = process.argv.slice(2);
const entry = registry[command];
const opts = parseArgsFromSchema(entry.schema, process.argv.slice(3));
process.stdout.write(entry.print(opts));
```

## Usage Examples

### Generate a new contract directly to a file

```bash
npx @openzeppelin/contracts-cli solidity-erc20 \
  --name MyToken --symbol MTK --mintable --pausable \
  > src/MyToken.sol
```

### Generate-compare-apply (agent workflow)

```bash
npx @openzeppelin/contracts-cli solidity-erc20 --name T --symbol T > /tmp/oz-baseline.sol
npx @openzeppelin/contracts-cli solidity-erc20 --name T --symbol T --mintable > /tmp/oz-feature.sol
diff /tmp/oz-baseline.sol /tmp/oz-feature.sol
```

Only the diff output enters the agent's context window.

### Discover available options

```bash
npx @openzeppelin/contracts-cli solidity-erc20 --help
```

```
solidity-erc20: Make a fungible token per the ERC-20 standard.

Required:
  --name <string>           The name of the contract
  --symbol <string>         The short symbol for the token

Options:
  --burnable                Whether token holders will be able to destroy their tokens
  --pausable                Whether privileged accounts will be able to pause ...
  --mintable                Whether privileged accounts will be able to create more supply ...
  --premint <string>        The number of tokens to premint for the deployer
  --permit                  Whether without paying gas, token holders will be able to ...
  --votes <blocknumber|timestamp>  Whether to keep track of historical balances for voting ...
  --flashmint               Whether to include built-in flash loans ...
  --access <ownable|roles|managed>  The type of access control to provision ...
  --upgradeable <transparent|uups>  Whether the smart contract is upgradeable ...
  --info.license <string>   The license used by the contract, default is "MIT"
  --info.securityContact <string>  Email where people can contact you to report security issues
```

### List all available commands

```bash
npx @openzeppelin/contracts-cli --help
```

```
Usage: contracts-cli <command> [options]

Commands:
  solidity-erc20, solidity-erc721, solidity-erc1155, solidity-stablecoin,
  solidity-rwa, solidity-account, solidity-governor, solidity-custom,
  cairo-erc20, cairo-erc721, ...

Run `contracts-cli <command> --help` for command-specific options.
```

## Test Migration

### Current state

The MCP package has ~25 test files. Here's what they actually test:

| Category | Files | What they assert |
|---|---|---|
| **Output correctness** | 24 files (e.g., `solidity/tools/erc20.test.ts`) | Given a set of options, the generated source matches the core wizard API output |
| **Error validation** | 4 tests across 2 files (`uniswap-hooks`, `stellar/non-fungible`) | Invalid option combos produce expected error messages |
| **MCP wiring** | 1 file (`server.test.ts`) | Each language has a tools folder, is exported, and registered in the server |

The output correctness tests use `assertAPIEquivalence()` from `helpers.test.ts`, which:
1. Calls the MCP tool callback with params
2. Calls the wizard API `print()` with the same params
3. Asserts the MCP result contains the wizard API output

These tests are actually testing **schema + options → print output** correctness. They route through the MCP tool callback, but the only reason for that is to verify the MCP layer doesn't mangle anything. The core assertion is: "do these Zod-validated options produce the expected contract source?"

### What should move to common

**Move: Schema validation tests** — new tests in `packages/common` that verify:
- Each schema field has a `.describe()` string (guards against accidentally dropping descriptions)
- Required vs optional fields match the core `*Options` TypeScript interfaces
- The `DeepRequired` type-level check (`assertHasAllSupportedFields`) ensuring schemas cover all options

These are pure schema tests with no MCP or CLI dependency.

**Move: The `DeepRequired` type utility and the `assertHasAllSupportedFields` pattern** — these enforce that schemas stay in sync with core option types. They belong wherever the schemas live.

### What should stay in MCP

**Keep: `server.test.ts`** — tests MCP server registration, tool folder structure, exports. Purely MCP-specific.

**Keep: `assertAPIEquivalence` tests, but simplified** — after the schema move, these become thin integration tests verifying the MCP tool callback correctly passes options through to the print function. They can be reduced to one "basic" and one "all options" test per tool (which is already the pattern), but now they're testing the MCP wiring layer specifically, not schema correctness.

### What's new for CLI

**Add: CLI integration tests in `packages/cli`** — test that the CLI entry point correctly parses argv flags and produces the expected stdout output. These mirror the MCP integration tests but for the CLI code path. A small set (one per language) is sufficient since the schema validation already lives in common.

### Summary of test changes

| Location | Tests | Purpose |
|---|---|---|
| `packages/common` (new) | Schema field coverage, type sync, description presence | Schemas are correct and complete |
| `packages/mcp` (kept) | `server.test.ts` | MCP server wiring |
| `packages/mcp` (simplified) | `assertAPIEquivalence` per tool | MCP callback passes options through correctly |
| `packages/cli` (new) | CLI argv → stdout tests | CLI parses flags and produces correct output |

## What Stays the Same

- All description strings in `packages/common` — unchanged
- All `print()` functions in `packages/core` — unchanged
- MCP tool handlers — unchanged (just import schemas from common instead of local)
- MCP server behavior — unchanged
- `@openzeppelin/contracts-mcp` package interface — unchanged

## What's New

| File | Lines (est.) | Purpose |
|---|---|---|
| `packages/common/src/ai/schemas/*.ts` | ~0 net (moved from mcp) | Zod schemas |
| `packages/cli/src/cli-adapter.ts` | ~60 | Zod schema → `util.parseArgs` |
| `packages/cli/src/index.ts` | ~50 | CLI entry point, registry, dispatch |
| `packages/cli/package.json` | ~20 | Package config |

~110 lines of new code. No new dependencies beyond what's already in the monorepo (Zod already used, `util.parseArgs` is built-in).

## Maintenance Burden

When a new contract type or option is added:
1. Add it to the Zod schema in `packages/common` and core `print()` function (same as today, just different location for the schema)
2. Register the MCP tool in `packages/mcp` (as today, importing schema from common)
3. Add one line to the CLI registry in `packages/cli`

Steps 1–2 are unchanged from today. Step 3 is the only new work — one registry entry per contract type. The schema move from mcp to common is a one-time refactor with no ongoing cost.
