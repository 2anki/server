export type PythonCrashKind =
  | 'invalid-markup'
  | 'unsupported-data-source'
  | 'too-large'
  | 'unknown';

interface PythonExitInfo {
  code: number | null;
  stdout: string;
  stderr: string;
  jobId?: string;
}

interface PythonExitErrorDetails {
  kind: PythonCrashKind;
  rawOutput: string;
  code: number | null;
}

export class PythonExitError extends Error {
  readonly kind: PythonCrashKind;
  readonly rawOutput: string;
  readonly code: number | null;

  constructor(message: string, details: PythonExitErrorDetails) {
    super(message);
    this.name = 'PythonExitError';
    this.kind = details.kind;
    this.rawOutput = details.rawOutput;
    this.code = details.code;
  }
}

const INVALID_MARKUP_MESSAGE =
  "Something on this page — usually a pasted embed or copied-in web content — has formatting we can't read. Open the page in Notion, remove or simplify that block, and convert again.";

const UNSUPPORTED_DATA_SOURCE_MESSAGE =
  "This Notion database uses a view we don't support yet. Convert the parent page, or switch the database to a different view and try again.";

const TOO_LARGE_MESSAGE =
  'This page is too large for us to convert in one go. Split it into smaller pages — or convert it section by section — and try again.';

function genericMessage(jobId = 'unavailable'): string {
  return `Something went wrong on our end converting this page. Email support@2anki.net with job ID ${jobId} and we'll take a look.`;
}

function hasInvalidMarkupSignature(output: string): boolean {
  return output.includes(
    'UserWarning: Field contained the following invalid HTML tags'
  );
}

function hasUnsupportedDataSourceSignature(output: string): boolean {
  return (
    output.includes("Unsupported 'data_source'!") ||
    output.includes('Unsupported "data_source"')
  );
}

function hasTooLargeSignature(output: string, code: number | null): boolean {
  if (code === 137) {
    return true;
  }
  if (output.includes('MemoryError')) {
    return true;
  }
  return output.split('\n').some((line) => line.trim() === 'Killed');
}

function classify(
  output: string,
  code: number | null
): Exclude<PythonCrashKind, 'unknown'> | null {
  if (hasInvalidMarkupSignature(output)) {
    return 'invalid-markup';
  }
  if (hasUnsupportedDataSourceSignature(output)) {
    return 'unsupported-data-source';
  }
  if (hasTooLargeSignature(output, code)) {
    return 'too-large';
  }
  return null;
}

function messageFor(kind: PythonCrashKind, jobId: string | undefined): string {
  if (kind === 'invalid-markup') {
    return INVALID_MARKUP_MESSAGE;
  }
  if (kind === 'unsupported-data-source') {
    return UNSUPPORTED_DATA_SOURCE_MESSAGE;
  }
  if (kind === 'too-large') {
    return TOO_LARGE_MESSAGE;
  }
  return genericMessage(jobId);
}

export function buildPythonExitError({
  code,
  stdout,
  stderr,
  jobId,
}: PythonExitInfo): PythonExitError {
  const trimmedStderr = stderr.trim();
  const trimmedStdout = stdout.trim();
  const rawOutput = trimmedStderr || trimmedStdout;
  const kind: PythonCrashKind = rawOutput
    ? (classify(rawOutput, code) ?? 'unknown')
    : 'unknown';
  return new PythonExitError(messageFor(kind, jobId), {
    kind,
    rawOutput,
    code,
  });
}
