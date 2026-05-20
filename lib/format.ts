export function fmtNum(n: number): string {
  return Math.round(n).toLocaleString('ko-KR');
}

export function fmtKrw(n: number): string {
  return Math.round(n).toLocaleString('ko-KR') + '원';
}

export function fmtJpy(n: number): string {
  return Math.round(n).toLocaleString('ko-KR') + '¥';
}

export function fmtRate(n: number): string {
  return (n * 100).toFixed(1) + '%';
}

export function fmtExchange(n: number): string {
  return n.toFixed(2);
}
