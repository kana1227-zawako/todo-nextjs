export const MAX_MEMO_LENGTH = 1000;

/**
 * 保存するメモを返す。文字列でない・空白や改行しかない場合は undefined（メモなし）。
 * 改行や前後の空白は、書いた人の意図かもしれないので消さずにそのまま残す
 */
export function normalizeMemo(value: unknown): string | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  return value;
}
