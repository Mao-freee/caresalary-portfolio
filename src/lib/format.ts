/** 金額・数値の表示フォーマット。全画面で統一して使う。 */

/** 12300 -> "¥12,300" */
export function yen(n: number): string {
  return '¥' + Math.round(n).toLocaleString('ja-JP')
}

/** 差額を符号つきで。プラスは "+"、マイナスは "−"（U+2212）、ゼロは "±"。 */
export function signedYen(n: number): string {
  const r = Math.round(n)
  if (r === 0) return '±¥0'
  const sign = r > 0 ? '+' : '−'
  return sign + '¥' + Math.abs(r).toLocaleString('ja-JP')
}

/** 0.015 -> "1.5%"（小数第1位まで、必要な桁のみ） */
export function percent(ratio: number, digits = 1): string {
  return (ratio * 100).toFixed(digits).replace(/\.0$/, '') + '%'
}

/** 12300 -> "12,300"（¥なし、台帳の桁揃え用） */
export function num(n: number): string {
  return Math.round(n).toLocaleString('ja-JP')
}

/** 12500000 -> "1,250万"（グラフ軸・大きな金額の要約用） */
export function manYen(n: number): string {
  return Math.round(n / 10000).toLocaleString('ja-JP') + '万'
}
