import { describe, expect, it } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { bindingTokens, loadItems } from '../items';

function helpCommands(): string[] {
  const out = execFileSync('agent-device', ['help'], { encoding: 'utf8' });
  const section = out.split(/^Commands:$/m)[1]?.split(/^Global Flags:$/m)[0];
  if (!section)
    throw new Error(
      'agent-device help の Commands: セクションを特定できない（help の書式が変わった）',
    );
  const names = new Set<string>();
  for (const line of section.split('\n')) {
    const name = line.match(/^ {2}([a-z][a-z0-9-]*)[ \t<]/)?.[1];
    if (name) names.add(name);
  }
  return [...names].sort();
}

describe('カバレッジ突合（権威列挙 = agent-device help）', () => {
  it('CLIの全コマンドが items.md のいずれかの binding に現れる', () => {
    const covered = bindingTokens(loadItems());
    const uncovered = helpCommands().filter((command) => !covered.has(command));
    expect(
      uncovered,
      `items.md が言及していないコマンド（新項目候補）: ${uncovered.join(', ')}`,
    ).toEqual([]);
  });
});
