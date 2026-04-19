import { buildPythonExitError } from './buildPythonExitError';

describe('buildPythonExitError', () => {
  test('uses stderr when present', () => {
    const error = buildPythonExitError({
      code: 1,
      stdout: 'progress output\n',
      stderr: 'Traceback (most recent call last):\n  ...\nValueError: bad deck\n',
    });
    expect(error.message).toContain('Python script exited with code 1');
    expect(error.message).toContain('ValueError: bad deck');
  });

  test('falls back to stdout when stderr is empty', () => {
    const error = buildPythonExitError({
      code: 1,
      stdout: 'fatal: missing template\n',
      stderr: '',
    });
    expect(error.message).toContain('Python script exited with code 1');
    expect(error.message).toContain('fatal: missing template');
  });

  test('uses a placeholder when both streams are empty', () => {
    const error = buildPythonExitError({
      code: 2,
      stdout: '',
      stderr: '   \n',
    });
    expect(error.message).toContain('Python script exited with code 2');
    expect(error.message).toContain('(no output)');
  });

  test('handles null exit code', () => {
    const error = buildPythonExitError({
      code: null,
      stdout: '',
      stderr: 'killed by signal',
    });
    expect(error.message).toContain('Python script exited with code null');
    expect(error.message).toContain('killed by signal');
  });
});
