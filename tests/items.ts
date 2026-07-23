import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
export const skillDir = path.join(
  repoRoot,
  'plugin',
  'agent-device-tvos',
  'skills',
  'agent-device-tvos',
);

export const TIERS = ['auto', 'manual', 'judgment', 'out-of-scope'] as const;

export interface Item {
  id: string;
  capability: string;
  binding: string;
  env: string;
  tier: string;
  verified: string;
  reflected_in: string;
  notes: string;
}

function splitMarkdownRow(line: string): string[] {
  return line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replace(/\\\|/g, '|'));
}

export function loadItems(): Item[] {
  const md = readFileSync(path.join(repoRoot, 'items.md'), 'utf8');
  const rows = md
    .trimEnd()
    .split('\n')
    .filter((line) => line.startsWith('|'));
  const [headerRow] = rows;
  if (!headerRow || rows.length < 2)
    throw new Error('items.md に Markdown テーブルが見つからない');
  const header = splitMarkdownRow(headerRow);
  return rows
    .slice(1)
    .filter((line) => !/^\|(\s*-+\s*\|)+$/.test(line))
    .map((line) => {
      const cells = splitMarkdownRow(line);
      const row: Record<string, string> = {};
      header.forEach((key, i) => {
        row[key] = cells[i] ?? '';
      });
      return row as unknown as Item;
    });
}

export function bindingTokens(items: Item[]): Set<string> {
  const tokens = new Set<string>();
  for (const item of items) {
    for (const token of item.binding.split(/[^a-z0-9-]+/)) {
      if (token) tokens.add(token);
    }
  }
  return tokens;
}
