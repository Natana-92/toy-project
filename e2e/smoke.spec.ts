import { expect, test } from "@playwright/test";

test("홈 화면이 열리고 서비스 제목과 지역 선택 필드가 보인다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("그때 샀더라면");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("그때 샀더라면");
  await expect(page.getByText("지역(구)")).toBeVisible();
});
