import type { AptTrade } from "./types";

/** 거래 목록에서 중복 없이 정렬된 단지명 목록을 반환한다. */
export function listApartmentNames(trades: AptTrade[]): string[] {
  return Array.from(new Set(trades.map((trade) => trade.aptName))).sort((a, b) => a.localeCompare(b, "ko"));
}

/** 지정한 단지명과 일치하는 거래만 남긴다. */
export function filterByApartment(trades: AptTrade[], aptName: string): AptTrade[] {
  return trades.filter((trade) => trade.aptName === aptName);
}

/** 중복 없이 오름차순 정렬된 전용면적(㎡) 목록을 반환한다. */
export function listExclusiveAreas(trades: AptTrade[]): number[] {
  return Array.from(new Set(trades.map((trade) => trade.exclusiveArea))).sort((a, b) => a - b);
}

/** 지정한 전용면적과 일치하는 거래만 남긴다. */
export function filterByExclusiveArea(trades: AptTrade[], exclusiveArea: number): AptTrade[] {
  return trades.filter((trade) => trade.exclusiveArea === exclusiveArea);
}

/** 실제 거래가 있었던 연도만 오름차순으로 반환한다. */
export function listDealYears(trades: AptTrade[]): number[] {
  return Array.from(new Set(trades.map((trade) => trade.dealYear))).sort((a, b) => a - b);
}

/** 해당 연도 거래의 평균 거래금액(만원)을 반환한다. 거래가 없으면 undefined. */
export function averageDealAmountByYear(trades: AptTrade[], year: number): number | undefined {
  const matched = trades.filter((trade) => trade.dealYear === year);
  if (matched.length === 0) return undefined;
  return matched.reduce((sum, trade) => sum + trade.dealAmount, 0) / matched.length;
}

function dealDateKey(trade: AptTrade): number {
  return trade.dealYear * 10000 + trade.dealMonth * 100 + trade.dealDay;
}

/** 계약년월일 기준 가장 최근 거래를 반환한다. 거래가 없으면 undefined. */
export function latestDeal(trades: AptTrade[]): AptTrade | undefined {
  if (trades.length === 0) return undefined;
  return trades.reduce((latest, trade) => (dealDateKey(trade) > dealDateKey(latest) ? trade : latest));
}

export type RegretResult = {
  /** 현재 시세 - 매수 시점 가격 (만원). 하락한 경우 음수. */
  diffAmount: number;
  /** 차액을 벌기 위해 일해야 하는 연수. 월급을 입력하지 않으면 undefined. */
  yearsOfSalary: number | undefined;
};

/** 매수 시점 가격과 현재 시세의 차액, 월급 대비 연수를 계산한다. */
export function calcRegretResult(input: {
  pastAmount: number;
  currentAmount: number;
  monthlySalary?: number;
}): RegretResult {
  const diffAmount = input.currentAmount - input.pastAmount;
  const yearsOfSalary = input.monthlySalary === undefined ? undefined : diffAmount / (input.monthlySalary * 12);
  return { diffAmount, yearsOfSalary };
}
