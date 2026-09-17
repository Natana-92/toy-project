import { describe, expect, it, vi } from "vitest";
import { geocodeAddress } from "./kakao-geocoder";

describe("geocodeAddress", () => {
  it("주소로 카카오 로컬 API를 호출해 좌표(위도·경도)를 반환한다", async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      expect(url).toBe(
        "https://dapi.kakao.com/v2/local/search/address.json?query=" +
          encodeURIComponent("서울 종로구 숭인동 766"),
      );
      expect((init?.headers as Record<string, string>).Authorization).toBe("KakaoAK TEST_REST_KEY");
      return {
        ok: true,
        json: async () => ({
          documents: [{ x: "127.017", y: "37.573" }],
        }),
      } as Response;
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await geocodeAddress("서울 종로구 숭인동 766", "TEST_REST_KEY");

    expect(result).toEqual({ lat: 37.573, lng: 127.017 });

    vi.unstubAllGlobals();
  });

  it("검색 결과가 없으면 null을 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({ documents: [] }) }) as unknown as Response),
    );

    const result = await geocodeAddress("존재하지 않는 주소", "TEST_REST_KEY");

    expect(result).toBeNull();

    vi.unstubAllGlobals();
  });

  it("카카오 API가 오류 응답을 주면 예외를 던진다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          ({
            ok: false,
            status: 403,
            json: async () => ({ errorType: "NotAuthorizedError", message: "disabled OPEN_MAP_AND_LOCAL service." }),
          }) as unknown as Response,
      ),
    );

    await expect(geocodeAddress("서울 종로구 숭인동 766", "TEST_REST_KEY")).rejects.toThrow();

    vi.unstubAllGlobals();
  });
});
