import { describe, expect, it } from "vitest";
import { listEverydayComparisons } from "./everyday-comparison";

describe("listEverydayComparisons", () => {
  it("금액(만원)을 자장면·치킨·피자 같은 일상 소비 단위 개수로 환산한다", () => {
    const result = listEverydayComparisons(300);

    expect(result).toEqual([
      { label: "자장면", emoji: "🍜", count: 300 / 0.7 },
      { label: "치킨", emoji: "🍗", count: 150 },
      { label: "피자", emoji: "🍕", count: 120 },
    ]);
  });

  it("금액이 0이면 모든 항목이 0개다", () => {
    const result = listEverydayComparisons(0);

    expect(result.every((item) => item.count === 0)).toBe(true);
  });
});
