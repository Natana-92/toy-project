import { fetchDistrictTrades, MolitApiError } from "@/lib/apt-trades/molit-client";
import { isValidSeoulDistrictCode } from "@/lib/apt-trades/seoul-districts";
import type { NextRequest } from "next/server";

// 2006년부터 현재까지 월별 배치 조회에 시간이 걸리므로, 플랫폼 기본 실행 제한(보통 10~15초)보다
// 넉넉하게 잡는다. Vercel Hobby 플랜의 상한을 넘기면 이 값 자체가 무시되고 플랫폼 기본값이 적용된다.
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const region = request.nextUrl.searchParams.get("region");

  if (!region || !isValidSeoulDistrictCode(region)) {
    return Response.json({ error: "지원하지 않는 지역입니다. 서울 25개 구 중에서 선택해 주세요." }, { status: 400 });
  }

  const serviceKey = process.env.MOLIT_SERVICE_KEY;
  if (!serviceKey) {
    return Response.json(
      { error: "서버에 국토부 API 인증키(MOLIT_SERVICE_KEY)가 설정되어 있지 않습니다." },
      { status: 500 },
    );
  }

  try {
    const trades = await fetchDistrictTrades({ regionCode: region, serviceKey });
    return Response.json({ trades });
  } catch (error) {
    if (error instanceof MolitApiError) {
      console.error(
        `[api/trades] region=${region} 국토부 API 오류 resultCode=${error.resultCode} resultMsg=${error.resultMsg}`,
      );
      return Response.json(
        { error: "국토부 실거래가 조회에 일시적으로 실패했습니다. 잠시 후 다시 시도해 주세요." },
        { status: 503 },
      );
    }
    console.error(`[api/trades] region=${region} 예기치 못한 오류`, error);
    return Response.json({ error: "실거래 데이터를 불러오는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
