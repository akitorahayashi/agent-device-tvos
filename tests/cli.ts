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
  const booted = out
    .split('\n')
    .filter((line) => line.includes('(ios simulator target=tv)'))
    .find((line) => line.includes('booted=true'));
  if (!booted)
    throw new Error(
      `起動中のtvOSシミュレータがない。.claude/skills/verification-setup の手順でセットアップすること:\n${out}`,
    );
  return (booted.split(' (ios simulator')[0] ?? booted).trim();
}
