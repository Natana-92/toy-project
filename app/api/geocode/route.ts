import { geocodeAddress } from "@/lib/apt-trades/kakao-geocoder";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address")?.trim();
  if (!address) {
    return Response.json({ error: "address 파라미터가 필요합니다." }, { status: 400 });
  }

  const restApiKey = process.env.KAKAO_REST_API_KEY?.trim();
  if (!restApiKey) {
    return Response.json(
      { error: "서버에 카카오 REST API 키(KAKAO_REST_API_KEY)가 설정되어 있지 않습니다." },
      { status: 500 },
    );
  }

  try {
    const point = await geocodeAddress(address, restApiKey);
    if (!point) {
      return Response.json({ error: "이 주소의 위치를 찾을 수 없습니다." }, { status: 404 });
    }
    return Response.json(point);
  } catch (error) {
    console.error(`[api/geocode] address=${address} 오류`, error);
    return Response.json({ error: "위치 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
