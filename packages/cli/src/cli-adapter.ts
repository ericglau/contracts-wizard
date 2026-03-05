import { z } from 'zod';

interface BaseTypeInfo {
  type: 'string' | 'boolean' | 'number' | 'object';
  enumValues?: string[];
}

function getBaseType(schema: z.ZodTypeAny): BaseTypeInfo {
  const def = schema._def;

  if (def.typeName === 'ZodOptional' || def.typeName === 'ZodNullable' || def.typeName === 'ZodDefault') {
    return getBaseType(def.innerType as z.ZodTypeAny);
  }
  if (def.typeName === 'ZodEffects') return getBaseType(def.schema as z.ZodTypeAny);
  if (def.typeName === 'ZodString') return { type: 'string' };
  if (def.typeName === 'ZodBoolean') return { type: 'boolean' };
  if (def.typeName === 'ZodNumber') return { type: 'number' };
  if (def.typeName === 'ZodLiteral') {
    const val = def.value;
    if (typeof val === 'boolean') return { type: 'boolean' };
    if (typeof val === 'string') return { type: 'string', enumValues: [val] };
    return { type: 'string' };
  }
  if (def.typeName === 'ZodEnum') return { type: 'string', enumValues: def.values as string[] };
  if (def.typeName === 'ZodUnion') {
    const options = def.options as z.ZodTypeAny[];
    const literals: string[] = [];
    let hasFalse = false;
    for (const opt of options) {
      const base = getBaseType(opt);
      if (base.enumValues) literals.push(...base.enumValues);
      if (opt._def.typeName === 'ZodLiteral' && opt._def.value === false) hasFalse = true;
    }
    if (literals.length > 0) return { type: 'string', enumValues: hasFalse ? ['false', ...literals] : literals };
    return { type: 'string' };
  }
  if (def.typeName === 'ZodObject') return { type: 'object' };
  return { type: 'string' };
}

function getDescription(schema: z.ZodTypeAny): string | undefined {
  if (schema.description) return schema.description;
  if (schema._def.typeName === 'ZodOptional') {
    return (schema._def.innerType as z.ZodTypeAny)?.description;
  }
  return undefined;
}

function isRequired(schema: z.ZodTypeAny): boolean {
  return schema._def.typeName !== 'ZodOptional' && schema._def.typeName !== 'ZodDefault';
}

export function generateHelp(commandName: string, shape: z.ZodRawShape, description?: string): string {
  const lines: string[] = [];
  lines.push(description ? `${commandName}: ${description}` : commandName);
  lines.push('');

  const required: string[] = [];
  const optional: string[] = [];

  for (const [key, schema] of Object.entries(shape)) {
    const zodSchema = schema as z.ZodTypeAny;
    const base = getBaseType(zodSchema);

    if (base.type === 'object') {
      const innerDef = zodSchema._def;
      const innerSchema =
        innerDef.typeName === 'ZodOptional'
          ? (innerDef.innerType as z.ZodObject<z.ZodRawShape>)
          : (zodSchema as z.ZodObject<z.ZodRawShape>);
      if (innerSchema._def?.typeName === 'ZodObject') {
        for (const [innerKey, innerField] of Object.entries(innerSchema.shape as z.ZodRawShape)) {
          const innerBase = getBaseType(innerField as z.ZodTypeAny);
          const typeStr = innerBase.enumValues ? innerBase.enumValues.join('|') : innerBase.type;
          const desc = getDescription(innerField as z.ZodTypeAny);
          const flag = innerBase.type === 'boolean' ? `  --${key}.${innerKey}` : `  --${key}.${innerKey} <${typeStr}>`;
          optional.push(`${flag.padEnd(40)}${desc ?? ''}`);
        }
      }
      continue;
    }

    const typeStr = base.enumValues ? base.enumValues.join('|') : base.type;
    const desc = getDescription(zodSchema) ?? '';
    const flag = base.type === 'boolean' ? `  --${key}` : `  --${key} <${typeStr}>`;
    const line = `${flag.padEnd(40)}${desc}`;

    if (isRequired(zodSchema)) {
      required.push(line);
    } else {
      optional.push(line);
    }
  }

  if (required.length > 0) {
    lines.push('Required:');
    lines.push(...required);
    lines.push('');
  }
  if (optional.length > 0) {
    lines.push('Options:');
    lines.push(...optional);
  }

  return lines.join('\n');
}

interface FieldMeta {
  base: BaseTypeInfo;
  isNumber: boolean;
  hasLiteralFalse: boolean;
}

function buildFieldMeta(shape: z.ZodRawShape): Map<string, FieldMeta> {
  const meta = new Map<string, FieldMeta>();
  for (const [key, schema] of Object.entries(shape)) {
    const base = getBaseType(schema as z.ZodTypeAny);
    meta.set(key, {
      base,
      isNumber: base.type === 'number',
      hasLiteralFalse: base.enumValues?.includes('false') ?? false,
    });
  }
  return meta;
}

/**
 * Manually parses argv against a Zod schema shape.
 * Handles: --flag (boolean true), --flag true|false, --flag value, --flag=value, --key.nested value
 */
export function parseArgsFromSchema<T extends z.ZodRawShape>(
  shape: T,
  argv: string[],
): z.infer<z.ZodObject<T>> {
  const fieldMeta = buildFieldMeta(shape);
  const nestedShapes = new Map<string, z.ZodRawShape>();

  // Collect nested object shapes
  for (const [key, schema] of Object.entries(shape)) {
    const zodSchema = schema as z.ZodTypeAny;
    const base = getBaseType(zodSchema);
    if (base.type === 'object') {
      const innerDef = zodSchema._def;
      const innerSchema =
        innerDef.typeName === 'ZodOptional'
          ? (innerDef.innerType as z.ZodObject<z.ZodRawShape>)
          : (zodSchema as z.ZodObject<z.ZodRawShape>);
      if (innerSchema._def?.typeName === 'ZodObject') {
        nestedShapes.set(key, innerSchema.shape as z.ZodRawShape);
      }
    }
  }

  const result: Record<string, unknown> = {};
  const nestedResults: Record<string, Record<string, unknown>> = {};

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i]!;
    if (!arg.startsWith('--')) {
      i++;
      continue;
    }

    let flagName: string;
    let inlineValue: string | undefined;

    const eqIndex = arg.indexOf('=');
    if (eqIndex !== -1) {
      flagName = arg.slice(2, eqIndex);
      inlineValue = arg.slice(eqIndex + 1);
    } else {
      flagName = arg.slice(2);
    }

    // Check for nested key (e.g., --info.license)
    const dotIndex = flagName.indexOf('.');
    if (dotIndex !== -1) {
      const parent = flagName.slice(0, dotIndex);
      const child = flagName.slice(dotIndex + 1);
      const nestedShape = nestedShapes.get(parent);
      if (nestedShape && child in nestedShape) {
        const innerBase = getBaseType(nestedShape[child] as z.ZodTypeAny);
        if (!nestedResults[parent]) nestedResults[parent] = {};
        if (innerBase.type === 'boolean') {
          const nextArg = inlineValue ?? argv[i + 1];
          if (nextArg === 'true') { nestedResults[parent]![child] = true; i += inlineValue ? 1 : 2; }
          else if (nextArg === 'false') { nestedResults[parent]![child] = false; i += inlineValue ? 1 : 2; }
          else { nestedResults[parent]![child] = true; i++; }
        } else {
          const value = inlineValue ?? argv[++i];
          nestedResults[parent]![child] = value;
          i++;
        }
        continue;
      }
    }

    const meta = fieldMeta.get(flagName);
    if (!meta) {
      i++;
      continue;
    }

    if (meta.base.type === 'boolean') {
      const nextArg = inlineValue ?? argv[i + 1];
      if (nextArg === 'true') { result[flagName] = true; i += inlineValue ? 1 : 2; }
      else if (nextArg === 'false') { result[flagName] = false; i += inlineValue ? 1 : 2; }
      else { result[flagName] = true; i++; }
    } else {
      const value = inlineValue ?? argv[++i];
      if (value === undefined) { i++; continue; }
      if (meta.isNumber) {
        result[flagName] = Number(value);
      } else if (meta.hasLiteralFalse && value === 'false') {
        result[flagName] = false;
      } else {
        result[flagName] = value;
      }
      i++;
    }
  }

  // Merge nested results
  for (const [parent, nested] of Object.entries(nestedResults)) {
    if (Object.keys(nested).length > 0) {
      result[parent] = nested;
    }
  }

  return result as z.infer<z.ZodObject<T>>;
}
