import { XMLParser } from "fast-xml-parser";
import type { AptTrade } from "./types";

// resultCode(예: "000")의 앞자리 0이 숫자로 잘못 변환되지 않도록 태그 값을 문자열로 유지한다.
const parser = new XMLParser({ parseTagValue: false });

function toNumber(value: unknown): number {
  return Number(String(value).replace(/,/g, "").trim());
}

/** 국토부 API가 정상(resultCode "000") 이외의 응답을 준 경우. 일일 트래픽 초과나
 * 초당 요청 제한처럼 서비스 레벨 이전의 공통 오류(cmmMsgHeader 구조)도 여기 포함한다. */
export class MolitApiError extends Error {
  constructor(
    public readonly resultCode: string,
    public readonly resultMsg: string,
  ) {
    super(`국토부 API 오류 (${resultCode}): ${resultMsg}`);
    this.name = "MolitApiError";
  }
}

/** 국토부 아파트 매매 실거래 API의 XML 응답을 AptTrade 배열로 정규화한다. */
export function parseAptTradeXml(xml: string): AptTrade[] {
  const parsed = parser.parse(xml);

  // 인증키 오류, 트래픽/요청수 초과 등 공통 오류는 <response><header> 대신
  // <OpenAPI_ServiceResponse><cmmMsgHeader> 구조로 내려온다.
  const commonError = parsed?.OpenAPI_ServiceResponse?.cmmMsgHeader;
  if (commonError) {
    throw new MolitApiError(String(commonError.returnReasonCode ?? ""), String(commonError.returnAuthMsg ?? commonError.errMsg ?? ""));
  }

  const resultCode = String(parsed?.response?.header?.resultCode ?? "");
  if (resultCode !== "000") {
    throw new MolitApiError(resultCode, String(parsed?.response?.header?.resultMsg ?? ""));
  }

  const rawItems = parsed?.response?.body?.items?.item;
  if (!rawItems) return [];
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];

  return items.map((item) => ({
    aptName: String(item.aptNm).trim(),
    exclusiveArea: toNumber(item.excluUseAr),
    dealAmount: toNumber(item.dealAmount),
    dealYear: toNumber(item.dealYear),
    dealMonth: toNumber(item.dealMonth),
    dealDay: toNumber(item.dealDay),
    dong: String(item.umdNm ?? "").trim(),
    jibun: String(item.jibun ?? "").trim(),
  }));
}

const MOLIT_APT_TRADE_ENDPOINT = "https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade";

/**
 * 법정동코드(시군구 5자리)와 계약년월(YYYYMM)로 그달 아파트 매매 실거래를 조회한다.
 * 같은 (regionCode, yearMonth) 조합의 fetch 결과는 Next.js Data Cache로 재사용된다.
 */
export async function fetchMonthlyTrades(params: {
  regionCode: string;
  yearMonth: string;
  serviceKey: string;
}): Promise<AptTrade[]> {
  const url =
    `${MOLIT_APT_TRADE_ENDPOINT}?serviceKey=${encodeURIComponent(params.serviceKey)}` +
    `&LAWD_CD=${params.regionCode}&DEAL_YMD=${params.yearMonth}&numOfRows=1000&pageNo=1`;

  const response = await fetch(url, { cache: "force-cache" });
  const xml = await response.text();
  return parseAptTradeXml(xml);
}

/** 시작 연월부터 until 시점(포함)까지의 계약년월(YYYYMM) 목록을 오름차순으로 만든다. */
export function listYearMonthsSince(start: { year: number; month: number }, until: Date): string[] {
  const result: string[] = [];
  let year = start.year;
  let month = start.month;
  const untilKey = until.getFullYear() * 100 + (until.getMonth() + 1);

  while (year * 100 + month <= untilKey) {
    result.push(`${year}${String(month).padStart(2, "0")}`);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return result;
}

/** 국토부 실거래가 공개 제도가 시작된 연월. */
export const TRADE_DISCLOSURE_START = { year: 2006, month: 1 };

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 국토부 API는 초당 요청 수 제한(LIMITED_NUMBER_OF_SERVICE_REQUESTS_PER_SECOND_EXCEEDS_ERROR)이 있어
// 완전 병렬 호출 시 대부분 거부당한다. 작은 배치로 나누고 배치 사이에 지연을 둔다.
// 배치 크기 8·지연 200ms는 라이브 테스트에서 여러 차례 "초당 서비스 요청제한 횟수 초과"로 거부당했다.
// 5·300ms는 같은 방식(2006년~현재 약 249개월)으로 반복 테스트해도 안정적으로 통과했다(2026-09-17 확인).
const MONTHLY_FETCH_BATCH_SIZE = 5;
const MONTHLY_FETCH_BATCH_DELAY_MS = 300;

/**
 * 지정한 구(법정동코드)의 시작 연월부터 until 시점까지 전체 아파트 매매 실거래를 모아 반환한다.
 * 내부적으로 월별 국토부 API 호출을 작은 배치로 나눠 수행하며, 각 (구, 계약년월) 조합은 Data Cache로 재사용된다.
 */
export async function fetchDistrictTrades(params: {
  regionCode: string;
  serviceKey: string;
  since?: { year: number; month: number };
  until?: Date;
}): Promise<AptTrade[]> {
  const yearMonths = listYearMonthsSince(params.since ?? TRADE_DISCLOSURE_START, params.until ?? new Date());

  const results: AptTrade[] = [];
  for (let i = 0; i < yearMonths.length; i += MONTHLY_FETCH_BATCH_SIZE) {
    const batch = yearMonths.slice(i, i + MONTHLY_FETCH_BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((yearMonth) =>
        fetchMonthlyTrades({ regionCode: params.regionCode, yearMonth, serviceKey: params.serviceKey }),
      ),
    );
    results.push(...batchResults.flat());
    if (i + MONTHLY_FETCH_BATCH_SIZE < yearMonths.length) {
      await delay(MONTHLY_FETCH_BATCH_DELAY_MS);
    }
  }

  return results;
}
