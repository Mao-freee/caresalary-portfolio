/** クラス名を条件付きで結合する軽量ヘルパー（外部依存なし）。 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
