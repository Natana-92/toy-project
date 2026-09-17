import { fetchDistrictTrades, MolitApiError } from "@/lib/apt-trades/molit-client";
import { isValidSeoulDistrictCode } from "@/lib/apt-trades/seoul-districts";
import type { NextRequest } from "next/server";

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
      return Response.json(
        { error: "국토부 실거래가 조회에 일시적으로 실패했습니다. 잠시 후 다시 시도해 주세요." },
        { status: 503 },
      );
    }
    throw error;
  }
}
