import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const pExecFile = promisify(execFile);

export const SESSION = 'adtv-verify';

export interface CliResult {
  code: number;
  out: string;
}

export async function ad(
  args: string[],
  timeoutMs = 120_000,
): Promise<CliResult> {
  try {
    const { stdout, stderr } = await pExecFile('agent-device', args, {
      timeout: timeoutMs,
      encoding: 'utf8',
    });
    return { code: 0, out: `${stdout}${stderr}` };
  } catch (error) {
    const e = error as { code?: number; stdout?: string; stderr?: string };
    return {
      code: typeof e.code === 'number' ? e.code : 1,
      out: `${e.stdout ?? ''}${e.stderr ?? ''}`,
    };
  }
}

export async function simulatorName(): Promise<string> {
  const { out } = await ad(['devices', '--platform', 'ios', '--target', 'tv']);
  const sims = out
    .split('\n')
    .filter((line) => line.includes('(ios simulator target=tv)'));
  const [first] = sims;
  if (!first) throw new Error(`tvOSシミュレータが見つからない:\n${out}`);
  const chosen = sims.find((line) => line.includes('booted=true')) ?? first;
  return (chosen.split(' (ios simulator')[0] ?? chosen).trim();
}
