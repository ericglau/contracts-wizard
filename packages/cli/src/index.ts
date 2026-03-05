#!/usr/bin/env node

import { parseArgsFromSchema, generateHelp } from './cli-adapter';
import { registry } from './registry';

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === '--help' || command === '-h') {
  const commands = Object.keys(registry);
  process.stdout.write(`Usage: contracts-cli <command> [options]

Commands:
  ${commands.join(', ')}

Run \`contracts-cli <command> --help\` for command-specific options.
`);
  process.exit(0);
}

const entry = registry[command];
if (!entry) {
  process.stderr.write(`Unknown command: ${command}\n\nRun \`contracts-cli --help\` for available commands.\n`);
  process.exit(1);
}

const commandArgs = args.slice(1);

if (commandArgs.includes('--help') || commandArgs.includes('-h')) {
  process.stdout.write(generateHelp(command, entry.schema, entry.description) + '\n');
  process.exit(0);
}

try {
  const opts = parseArgsFromSchema(entry.schema, commandArgs);
  process.stdout.write(entry.print(opts));
} catch (e) {
  if (e instanceof Error) {
    process.stderr.write(`Error: ${e.message}\n`);
  } else {
    process.stderr.write(`Error: ${e}\n`);
  }
  process.exit(1);
}
