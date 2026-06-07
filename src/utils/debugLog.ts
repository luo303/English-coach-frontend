let logSeq = 0;

export function debugLog(scope: string, message: string, details?: unknown) {
  logSeq += 1;
  const prefix = `[EnglishCoach][${String(logSeq).padStart(4, '0')}][${new Date().toISOString()}][${scope}] ${message}`;

  if (details === undefined) {
    console.log(prefix);
    return;
  }

  console.log(prefix, details);
}
