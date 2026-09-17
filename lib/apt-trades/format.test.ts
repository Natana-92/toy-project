import { describe, expect, it } from "vitest";
import { formatManwon } from "./format";

describe("formatManwon", () => {
  it("억 단위와 만원 단위를 함께 표기한다", () => {
    expect(formatManwon(72000)).toBe("7억 2,000만원");
  });

  it("만원 부분이 0이면 억 단위만 표기한다", () => {
    expect(formatManwon(10000)).toBe("1억원");
  });

  it("억 미만이면 만원 단위만 표기한다", () => {
    expect(formatManwon(5000)).toBe("5,000만원");
  });

  it("음수 금액에는 부호를 붙인다", () => {
    expect(formatManwon(-72000)).toBe("-7억 2,000만원");
  });
});
