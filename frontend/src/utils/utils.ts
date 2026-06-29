export function normalizeRoleCode(input: string): string {
  return input.replace(/[^A-Za-z0-9_]/gu, '').toUpperCase();
}

function twoDigitHash(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 100;
  }
  return String(hash).padStart(2, '0');
}

function compactPrefix(word: string): string {
  const upper = word.toUpperCase().replace(/[^A-Z0-9]/gu, '');
  if (upper.length <= 4) return upper;
  const withoutVowels = upper[0] + upper.slice(1).replace(/[AEIOU]/gu, '');
  return (withoutVowels || upper).slice(0, 4);
}

/** Generate compact role code. Example: "Role manager" -> "MNGR29". */
export function generateSequence(roleName: string): string {
  const words = roleName
    .trim()
    .split(/[\s_-]+/u)
    .map((w) => w.trim().toUpperCase())
    .filter(Boolean);
  if (!words.length) return '';

  const baseWord = words[words.length - 1];
  const prefix = compactPrefix(baseWord);
  const suffix = twoDigitHash(words.join(' '));
  return normalizeRoleCode(`${prefix}${suffix}`);
}