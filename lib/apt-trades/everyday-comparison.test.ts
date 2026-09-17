import { describe, expect, it } from "vitest";
import { listEverydayComparisons } from "./everyday-comparison";

describe("listEverydayComparisons", () => {
  it("금액(만원)을 자장면·치킨 같은 일상 소비 단위 개수로 환산한다", () => {
    const result = listEverydayComparisons(7);

    expect(result).toEqual([
      { label: "자장면", emoji: "🍜", count: 10 },
      { label: "치킨", emoji: "🍗", count: 3.5 },
    ]);
  });

  it("금액이 0이면 모든 항목이 0개다", () => {
    const result = listEverydayComparisons(0);

    expect(result.every((item) => item.count === 0)).toBe(true);
  });
});
