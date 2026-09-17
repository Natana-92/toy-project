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
  /** 법정동명(예: "숭인동"). 지도 표시를 위한 지번 주소 조합에 쓴다. */
  dong: string;
  /** 지번(예: "766"). 법정동명과 합쳐 지번 주소를 만든다. */
  jibun: string;
};
