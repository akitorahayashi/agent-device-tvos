// items.md の manual tier を実機検証チェックリストとして印字する（bun run verify-device）
import { loadItems } from '../tests/items';

const manual = loadItems().filter((item) => item.tier === 'manual');
console.log(
  `manual tier: ${manual.length} 項目（実機・手動で再検証し、結果を items.md と references に反映する）\n`,
);
for (const item of manual) {
  console.log(`[ ] ${item.id}`);
  console.log(`    確認: ${item.capability}`);
  console.log(`    手段: ${item.binding}`);
  console.log(
    `    現状: ${item.verified}${item.notes ? ` / ${item.notes}` : ''}`,
  );
  console.log(`    反映先: ${item.reflected_in}\n`);
}
