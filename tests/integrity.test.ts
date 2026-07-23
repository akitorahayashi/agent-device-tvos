import { describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadItems, skillDir, TIERS } from './items';

describe('items.md の整合性', () => {
  const items = loadItems();

  it('全行が全列を持ち、id が一意である', () => {
    const ids = items.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const item of items) {
      expect(item.id, JSON.stringify(item)).toBeTruthy();
      expect(item.capability, item.id).toBeTruthy();
      expect(item.binding, item.id).toBeTruthy();
    }
  });

  it('tier が定義済みの値である', () => {
    const tiers: readonly string[] = TIERS;
    for (const item of items) {
      expect(tiers, `${item.id}: tier=${item.tier}`).toContain(item.tier);
    }
  });

  it('reflected_in が実在するスキルファイルを指す', () => {
    for (const item of items) {
      if (item.reflected_in === '-' || item.reflected_in === '') continue;
      for (const name of item.reflected_in.split(',').map((s) => s.trim())) {
        const file =
          name === 'SKILL.md'
            ? path.join(skillDir, name)
            : path.join(skillDir, 'references', name);
        expect(existsSync(file), `${item.id}: ${name} が存在しない`).toBe(true);
      }
    }
  });

  it('out-of-scope 以外の行は検証状態と反映先を持つ', () => {
    for (const item of items) {
      if (item.tier === 'out-of-scope') continue;
      expect(item.verified, `${item.id}: verified が空`).toBeTruthy();
      expect(item.env, `${item.id}: env が空`).toBeTruthy();
    }
  });
});
