import { describe, expect, it } from "vitest";
import {
  averageDealAmountByYear,
  calcRegretResult,
  filterByApartment,
  filterByExclusiveArea,
  latestDeal,
  listApartmentNames,
  listDealYears,
  listExclusiveAreas,
} from "./regret";
import type { AptTrade } from "./types";

function trade(overrides: Partial<AptTrade>): AptTrade {
  return {
    aptName: "래미안",
    exclusiveArea: 84.9,
    dealAmount: 100000,
    dealYear: 2020,
    dealMonth: 1,
    dealDay: 1,
    ...overrides,
  };
}

describe("listApartmentNames", () => {
  it("거래 목록에서 중복 없이 정렬된 단지명 목록을 반환한다", () => {
    const trades = [
      trade({ aptName: "래미안" }),
      trade({ aptName: "푸르지오" }),
      trade({ aptName: "래미안" }),
    ];

    expect(listApartmentNames(trades)).toEqual(["래미안", "푸르지오"]);
  });
});

describe("filterByApartment", () => {
  it("지정한 단지명과 일치하는 거래만 남긴다", () => {
    const target = trade({ aptName: "래미안", exclusiveArea: 59.9 });
    const trades = [target, trade({ aptName: "푸르지오" })];

    expect(filterByApartment(trades, "래미안")).toEqual([target]);
  });
});

describe("listExclusiveAreas", () => {
  it("중복 없이 오름차순 정렬된 전용면적 목록을 반환한다", () => {
    const trades = [
      trade({ exclusiveArea: 84.9 }),
      trade({ exclusiveArea: 59.9 }),
      trade({ exclusiveArea: 84.9 }),
    ];

    expect(listExclusiveAreas(trades)).toEqual([59.9, 84.9]);
  });
});

describe("filterByExclusiveArea", () => {
  it("지정한 전용면적과 일치하는 거래만 남긴다", () => {
    const target = trade({ exclusiveArea: 59.9 });
    const trades = [target, trade({ exclusiveArea: 84.9 })];

    expect(filterByExclusiveArea(trades, 59.9)).toEqual([target]);
  });
});

describe("listDealYears", () => {
  it("실제 거래가 있었던 연도만 오름차순으로 반환한다", () => {
    const trades = [
      trade({ dealYear: 2016 }),
      trade({ dealYear: 2021 }),
      trade({ dealYear: 2016 }),
    ];

    expect(listDealYears(trades)).toEqual([2016, 2021]);
  });
});

describe("averageDealAmountByYear", () => {
  it("해당 연도 거래가 여러 건이면 평균 거래금액을 반환한다", () => {
    const trades = [
      trade({ dealYear: 2016, dealAmount: 50000 }),
      trade({ dealYear: 2016, dealAmount: 70000 }),
      trade({ dealYear: 2021, dealAmount: 999999 }),
    ];

    expect(averageDealAmountByYear(trades, 2016)).toBe(60000);
  });

  it("해당 연도에 거래가 없으면 undefined를 반환한다", () => {
    const trades = [trade({ dealYear: 2021 })];

    expect(averageDealAmountByYear(trades, 2016)).toBeUndefined();
  });
});

describe("latestDeal", () => {
  it("계약년월일 기준으로 가장 최근 거래를 반환한다", () => {
    const latest = trade({ dealYear: 2024, dealMonth: 3, dealDay: 5 });
    const trades = [
      trade({ dealYear: 2020, dealMonth: 12, dealDay: 31 }),
      latest,
      trade({ dealYear: 2024, dealMonth: 3, dealDay: 1 }),
    ];

    expect(latestDeal(trades)).toEqual(latest);
  });

  it("거래가 없으면 undefined를 반환한다", () => {
    expect(latestDeal([])).toBeUndefined();
  });
});

describe("calcRegretResult", () => {
  it("금액 차액과 월급 대비 연수를 계산한다", () => {
    const result = calcRegretResult({
      pastAmount: 30000,
      currentAmount: 102000,
      monthlySalary: 300,
    });

    expect(result).toEqual({ diffAmount: 72000, yearsOfSalary: 20 });
  });

  it("월급을 입력하지 않으면 금액 차액만 반환한다", () => {
    const result = calcRegretResult({ pastAmount: 30000, currentAmount: 102000 });

    expect(result).toEqual({ diffAmount: 72000, yearsOfSalary: undefined });
  });

  it("현재가가 매수가보다 낮으면 음수 차액을 그대로 반환한다", () => {
    const result = calcRegretResult({ pastAmount: 50000, currentAmount: 40000, monthlySalary: 300 });

    expect(result).toEqual({ diffAmount: -10000, yearsOfSalary: -10000 / 3600 });
  });
});
