import { describe, expect, it, vi } from "vitest";
import { fetchDistrictTrades, fetchMonthlyTrades, listYearMonthsSince, MolitApiError, parseAptTradeXml } from "./molit-client";

const SAMPLE_XML = `<response>
  <header>
    <resultCode>000</resultCode>
    <resultMsg>OK</resultMsg>
  </header>
  <body>
    <items>
      <item>
        <aptNm>래미안</aptNm>
        <excluUseAr>84.97</excluUseAr>
        <dealAmount>   72,000</dealAmount>
        <dealYear>2016</dealYear>
        <dealMonth>3</dealMonth>
        <dealDay>15</dealDay>
      </item>
      <item>
        <aptNm>푸르지오</aptNm>
        <excluUseAr>59.92</excluUseAr>
        <dealAmount>45,500</dealAmount>
        <dealYear>2016</dealYear>
        <dealMonth>3</dealMonth>
        <dealDay>2</dealDay>
      </item>
    </items>
    <numOfRows>10</numOfRows>
    <pageNo>1</pageNo>
    <totalCount>2</totalCount>
  </body>
</response>`;

describe("parseAptTradeXml", () => {
  it("정상 응답의 item들을 AptTrade 배열로 정규화한다", () => {
    expect(parseAptTradeXml(SAMPLE_XML)).toEqual([
      { aptName: "래미안", exclusiveArea: 84.97, dealAmount: 72000, dealYear: 2016, dealMonth: 3, dealDay: 15 },
      { aptName: "푸르지오", exclusiveArea: 59.92, dealAmount: 45500, dealYear: 2016, dealMonth: 3, dealDay: 2 },
    ]);
  });

  it("그 달 거래가 없으면 빈 배열을 반환한다", () => {
    const xml = `<response><header><resultCode>000</resultCode></header><body><items></items><totalCount>0</totalCount></body></response>`;

    expect(parseAptTradeXml(xml)).toEqual([]);
  });

  it("item이 한 건뿐이어도 배열로 정규화한다", () => {
    const xml = `<response><header><resultCode>000</resultCode></header><body><items>
      <item>
        <aptNm>래미안</aptNm>
        <excluUseAr>84.97</excluUseAr>
        <dealAmount>72,000</dealAmount>
        <dealYear>2016</dealYear>
        <dealMonth>3</dealMonth>
        <dealDay>15</dealDay>
      </item>
    </items></body></response>`;

    expect(parseAptTradeXml(xml)).toEqual([
      { aptName: "래미안", exclusiveArea: 84.97, dealAmount: 72000, dealYear: 2016, dealMonth: 3, dealDay: 15 },
    ]);
  });

  it("resultCode가 정상(000)이 아니면 MolitApiError를 던진다", () => {
    const xml = `<response><header><resultCode>22</resultCode><resultMsg>LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR</resultMsg></header><body></body></response>`;

    expect(() => parseAptTradeXml(xml)).toThrow(MolitApiError);
  });

  it("공통 오류(cmmMsgHeader) 구조로 오는 초당 요청 제한 응답도 MolitApiError를 던진다", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenAPI_ServiceResponse>
<cmmMsgHeader>
  <errMsg>LIMITED_NUMBER_OF_SERVICE_REQUESTS_PER_SECOND_EXCEEDS_ERROR</errMsg>
  <returnAuthMsg>초당 서비스 요청제한 횟수 초과 에러</returnAuthMsg>
  <returnReasonCode>23</returnReasonCode>
</cmmMsgHeader>
</OpenAPI_ServiceResponse>`;

    expect(() => parseAptTradeXml(xml)).toThrow(MolitApiError);
  });
});

describe("fetchMonthlyTrades", () => {
  it("법정동코드와 계약년월로 국토부 API를 호출하고 결과를 정규화한다", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      expect(url).toBe(
        "https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade" +
          "?serviceKey=TEST_KEY&LAWD_CD=11680&DEAL_YMD=201603&numOfRows=1000&pageNo=1",
      );
      return { text: async () => SAMPLE_XML } as Response;
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchMonthlyTrades({
      regionCode: "11680",
      yearMonth: "201603",
      serviceKey: "TEST_KEY",
    });

    expect(result).toEqual([
      { aptName: "래미안", exclusiveArea: 84.97, dealAmount: 72000, dealYear: 2016, dealMonth: 3, dealDay: 15 },
      { aptName: "푸르지오", exclusiveArea: 59.92, dealAmount: 45500, dealYear: 2016, dealMonth: 3, dealDay: 2 },
    ]);

    vi.unstubAllGlobals();
  });
});

describe("listYearMonthsSince", () => {
  it("시작 연월부터 기준 시점까지의 계약년월(YYYYMM) 목록을 오름차순으로 만든다", () => {
    const until = new Date(2025, 0, 15); // 2025-01-15, 로컬 월은 0-based

    expect(listYearMonthsSince({ year: 2024, month: 11 }, until)).toEqual(["202411", "202412", "202501"]);
  });
});

describe("fetchDistrictTrades", () => {
  it("시작 연월부터 기준 시점까지 매달 조회한 거래를 하나의 배열로 합친다", async () => {
    const xmlByYearMonth: Record<string, string> = {
      "201601": `<response><header><resultCode>000</resultCode></header><body><items>
        <item><aptNm>1월단지</aptNm><excluUseAr>59.9</excluUseAr><dealAmount>10,000</dealAmount><dealYear>2016</dealYear><dealMonth>1</dealMonth><dealDay>1</dealDay></item>
      </items></body></response>`,
      "201602": `<response><header><resultCode>000</resultCode></header><body><items></items></body></response>`,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        const yearMonth = new URL(url).searchParams.get("DEAL_YMD")!;
        return { text: async () => xmlByYearMonth[yearMonth] } as Response;
      }),
    );

    const result = await fetchDistrictTrades({
      regionCode: "11680",
      serviceKey: "TEST_KEY",
      since: { year: 2016, month: 1 },
      until: new Date(2016, 1, 1),
    });

    expect(result).toEqual([
      { aptName: "1월단지", exclusiveArea: 59.9, dealAmount: 10000, dealYear: 2016, dealMonth: 1, dealDay: 1 },
    ]);

    vi.unstubAllGlobals();
  });
});
