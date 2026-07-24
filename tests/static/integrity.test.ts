import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { loadItems, repoRoot, skillDir, TIERS } from '../items';

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

  it('auto 行だけが test を持ち、他 tier は test を持たない', () => {
    for (const item of items) {
      if (item.tier === 'auto')
        expect(
          item.test && item.test !== '-',
          `${item.id}: auto なのに test 列が空`,
        ).toBe(true);
      else
        expect(
          item.test,
          `${item.id}: 非auto なのに test 列が埋まっている`,
        ).toBe('-');
    }
  });

  it('auto 行の test ファイルが実在し、id を冠したテスト（it）を含む', () => {
    for (const item of items) {
      if (item.tier !== 'auto') continue;
      const file = path.join(repoRoot, item.test);
      expect(existsSync(file), `${item.id}: ${item.test} が存在しない`).toBe(
        true,
      );
      const body = readFileSync(file, 'utf8');
      const owner = new RegExp(`\\bit\\(\\s*['"]${item.id}: `);
      expect(
        owner.test(body),
        `${item.id}: ${item.test} に it('${item.id}: ...') が無い（コメント記載では所有と見なさない）`,
      ).toBe(true);
    }
  });
});
