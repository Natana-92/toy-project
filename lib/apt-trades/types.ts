/** 국토교통부 아파트 매매 실거래 한 건을 나타내는 도메인 타입. */
export type AptTrade = {
  /** 단지명. 실거래 데이터 원본 표기를 그대로 담는다. */
  aptName: string;
  /** 전용면적(㎡). */
  exclusiveArea: number;
  /** 거래금액(만원). */
  dealAmount: number;
  dealYear: number;
  dealMonth: number;
  dealDay: number;
};
