/** 만원 단위 금액을 "N억 M,MMM만원" 형태의 한글 표기로 변환한다. */
export function formatManwon(amountInManwon: number): string {
  const sign = amountInManwon < 0 ? "-" : "";
  const abs = Math.abs(amountInManwon);
  const eok = Math.floor(abs / 10000);
  const remainder = abs % 10000;

  if (eok === 0) {
    return `${sign}${remainder.toLocaleString("ko-KR")}만원`;
  }
  if (remainder === 0) {
    return `${sign}${eok}억원`;
  }
  return `${sign}${eok}억 ${remainder.toLocaleString("ko-KR")}만원`;
}
