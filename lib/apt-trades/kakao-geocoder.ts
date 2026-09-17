export type GeoPoint = {
  lat: number;
  lng: number;
};

const KAKAO_ADDRESS_SEARCH_ENDPOINT = "https://dapi.kakao.com/v2/local/search/address.json";

/** 카카오 로컬 API가 오류 응답(인증 실패, 서비스 미활성화 등)을 준 경우. */
export class KakaoLocalApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(`카카오 로컬 API 오류 (${status}): ${message}`);
    this.name = "KakaoLocalApiError";
  }
}

/** 주소 문자열을 카카오 로컬 API로 좌표(위도·경도)로 변환한다. 검색 결과가 없으면 null. */
export async function geocodeAddress(address: string, restApiKey: string): Promise<GeoPoint | null> {
  const url = `${KAKAO_ADDRESS_SEARCH_ENDPOINT}?query=${encodeURIComponent(address)}`;
  const response = await fetch(url, {
    headers: { Authorization: `KakaoAK ${restApiKey}` },
    cache: "force-cache",
  });
  const body = await response.json();

  if (!response.ok) {
    throw new KakaoLocalApiError(response.status, String(body?.message ?? body?.errorType ?? "알 수 없는 오류"));
  }

  const first = body?.documents?.[0];
  if (!first) return null;

  return { lat: Number(first.y), lng: Number(first.x) };
}
