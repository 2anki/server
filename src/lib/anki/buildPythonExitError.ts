interface PythonExitInfo {
  code: number | null;
  stdout: string;
  stderr: string;
}

export function buildPythonExitError({
  code,
  stdout,
  stderr,
}: PythonExitInfo): Error {
  const trimmedStderr = stderr.trim();
  const trimmedStdout = stdout.trim();
  const output = trimmedStderr || trimmedStdout || '(no output)';
  return new Error(`Python script exited with code ${code}: ${output}`);
}
