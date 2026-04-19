let sequence = 0;

export function uniqueTimerLabel(prefix: string): string {
  sequence += 1;
  return `${prefix}#${sequence}`;
}
