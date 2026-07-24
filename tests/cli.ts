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
    const e = error as {
      code?: number;
      signal?: string;
      stdout?: string;
      stderr?: string;
    };
    // 打ち切られた子プロセスの途中出力を環境不備と誤認しないよう、シグナルを残す。
    const killed = e.signal ? `\n[agent-device killed by ${e.signal}]` : '';
    return {
      code: typeof e.code === 'number' ? e.code : 1,
      out: `${e.stdout ?? ''}${e.stderr ?? ''}${killed}`,
    };
  }
}

export async function simulatorName(): Promise<string> {
  const { out } = await ad(['devices', '--platform', 'ios', '--target', 'tv']);
  const booted = out
    .split('\n')
    .filter((line) => line.includes('(ios simulator target=tv)'))
    .filter((line) => line.includes('booted=true'));
  const [only] = booted;
  if (!only || booted.length !== 1)
    throw new Error(
      `起動中のtvOSシミュレータがちょうど1台である必要がある（現在${booted.length}台）。` +
        `.claude/skills/verification-setup の手順で整えること:\n${out}`,
    );
  return (only.split(' (ios simulator')[0] ?? only).trim();
}
