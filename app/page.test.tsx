import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";

test("홈 화면은 서비스 제목과 지역 선택 필드를 보여준다", () => {
  render(<Home />);

  expect(screen.getByRole("heading", { level: 1, name: "그때 샀더라면" })).toBeInTheDocument();
  expect(screen.getByText("지역(구)")).toBeInTheDocument();
});
