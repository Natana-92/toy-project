"use client";

import { useMemo, useRef, useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RegretMinerAnimation } from "@/components/regret-miner-animation";
import { EverydayComparisonList } from "@/components/everyday-comparison-list";
import { AptLocationMap } from "@/components/apt-location-map";
import { formatManwon } from "@/lib/apt-trades/format";
import {
  averageDealAmountByYear,
  calcRegretResult,
  filterByApartment,
  filterByExclusiveArea,
  latestDeal,
  listApartmentNames,
  listDealYears,
  listExclusiveAreas,
} from "@/lib/apt-trades/regret";
import { RECENT_TRADES_WINDOW_MONTHS } from "@/lib/apt-trades/molit-client";
import { SEOUL_DISTRICTS } from "@/lib/apt-trades/seoul-districts";
import type { AptTrade } from "@/lib/apt-trades/types";

const districtSelectItems = [
  { label: "구를 선택해 주세요", value: null as string | null },
  ...SEOUL_DISTRICTS.map((district) => ({ label: district.name, value: district.code })),
];

export default function Home() {
  const [districtCode, setDistrictCode] = useState<string | null>(null);
  const [trades, setTrades] = useState<AptTrade[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [aptName, setAptName] = useState<string | null>(null);
  const [area, setArea] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [salaryInput, setSalaryInput] = useState("");

  // 구를 바꾸는 도중에 이전 요청 응답이 늦게 도착해 최신 선택을 덮어쓰지 않도록 순번으로 구분한다.
  const requestIdRef = useRef(0);

  async function handleDistrictChange(code: string | null) {
    const requestId = ++requestIdRef.current;
    setDistrictCode(code);
    setTrades(null);
    setAptName(null);
    setArea(null);
    setYear(null);
    setLoadError(null);
    setHistoryError(null);

    if (!code) return;

    // 1단계: 최근 기간만 빠르게 받아 아파트 목록을 먼저 보여준다.
    setLoading(true);
    let recentTrades: AptTrade[] | null = null;
    try {
      const response = await fetch(`/api/trades?region=${code}&sinceMonths=${RECENT_TRADES_WINDOW_MONTHS}`);
      const body = await response.json();
      if (requestIdRef.current !== requestId) return;
      if (!response.ok) {
        setLoadError(body.error ?? "실거래 데이터를 불러오지 못했습니다.");
      } else {
        recentTrades = body.trades as AptTrade[];
        setTrades(recentTrades);
      }
    } catch {
      if (requestIdRef.current !== requestId) return;
      setLoadError("실거래 데이터를 불러오지 못했습니다. 네트워크 상태를 확인해 주세요.");
    } finally {
      if (requestIdRef.current === requestId) setLoading(false);
    }

    if (!recentTrades) return;

    // 2단계: 2006년부터의 전체 기간을 백그라운드로 이어받아 과거 연도 비교를 가능하게 한다.
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/trades?region=${code}`);
      const body = await response.json();
      if (requestIdRef.current !== requestId) return;
      if (response.ok) {
        setTrades(body.trades as AptTrade[]);
      } else {
        setHistoryError(body.error ?? "과거 실거래 데이터를 모두 불러오지 못했습니다.");
      }
    } catch {
      if (requestIdRef.current !== requestId) return;
      setHistoryError("과거 실거래 데이터를 모두 불러오지 못했습니다.");
    } finally {
      if (requestIdRef.current === requestId) setLoadingHistory(false);
    }
  }

  function handleAptChange(next: string | null) {
    setAptName(next);
    setArea(null);
    setYear(null);
  }

  function handleAreaChange(next: number | null) {
    setArea(next);
    setYear(null);
  }

  const apartments = useMemo(() => (trades ? listApartmentNames(trades) : []), [trades]);
  const aptTrades = useMemo(
    () => (trades && aptName ? filterByApartment(trades, aptName) : []),
    [trades, aptName],
  );
  const aptAddress = useMemo(() => {
    if (!aptName || aptTrades.length === 0) return null;
    const district = SEOUL_DISTRICTS.find((d) => d.code === districtCode);
    const representative = aptTrades[0];
    if (!district || !representative.dong || !representative.jibun) return null;
    return `서울 ${district.name} ${representative.dong} ${representative.jibun}`;
  }, [aptName, aptTrades, districtCode]);

  const areas = useMemo(() => listExclusiveAreas(aptTrades), [aptTrades]);
  const areaTrades = useMemo(
    () => (area !== null ? filterByExclusiveArea(aptTrades, area) : []),
    [aptTrades, area],
  );
  const years = useMemo(() => listDealYears(areaTrades), [areaTrades]);

  const areaSelectItems = useMemo(
    () =>
      areas.map((value) => ({
        label: `${value}㎡ (약 ${Math.round((value / 3.3058) * 10) / 10}평)`,
        value,
      })),
    [areas],
  );
  const yearSelectItems = useMemo(() => years.map((value) => ({ label: `${value}년`, value })), [years]);

  const pastAmount = year !== null ? averageDealAmountByYear(areaTrades, year) : undefined;
  const latest = latestDeal(areaTrades);
  const parsedSalary = salaryInput.trim() === "" ? undefined : Number(salaryInput);
  const monthlySalary = parsedSalary !== undefined && parsedSalary > 0 ? parsedSalary : undefined;
  const result =
    pastAmount !== undefined && latest
      ? calcRegretResult({ pastAmount, currentAmount: latest.dealAmount, monthlySalary })
      : undefined;
  const noComparison = year !== null && (pastAmount === undefined || !latest);

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 py-16 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 px-4">
        <header className="flex flex-col gap-2 text-center">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">그때 샀더라면</h1>
          <p className="text-muted-foreground">
            서울 아파트 단지와 매수 연도를 고르면, 지금 시세와의 차액을 월급 몇 년치로 보여드립니다.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>어디, 언제, 얼마에 샀다면</CardTitle>
            <CardDescription>국토교통부 아파트 매매 실거래가를 기준으로 계산합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>지역(구)</FieldLabel>
                <Select
                  items={districtSelectItems}
                  value={districtCode}
                  onValueChange={(next) => handleDistrictChange(next as string | null)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {districtSelectItems.map((item) => (
                        <SelectItem key={item.value ?? "placeholder"} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              {loading && <Skeleton className="h-9 w-full" />}

              {loadError && (
                <Alert variant="destructive">
                  <AlertTitle>일시적으로 조회할 수 없습니다</AlertTitle>
                  <AlertDescription>{loadError}</AlertDescription>
                </Alert>
              )}

              {trades && !loadError && (
                <Field>
                  <FieldLabel>아파트 단지</FieldLabel>
                  <Combobox items={apartments} value={aptName} onValueChange={handleAptChange}>
                    <ComboboxInput placeholder="단지명을 검색해 주세요" />
                    <ComboboxContent>
                      <ComboboxEmpty>일치하는 단지가 없습니다.</ComboboxEmpty>
                      <ComboboxList>
                        {(item) => (
                          <ComboboxItem key={item} value={item}>
                            {item}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  <FieldDescription>
                    {loadingHistory
                      ? `최근 ${RECENT_TRADES_WINDOW_MONTHS}개월 기준 목록입니다. 2006년까지의 과거 기록을 마저 불러오는 중입니다...`
                      : "이 구에서 실거래 기록이 있는 단지만 검색됩니다."}
                  </FieldDescription>
                </Field>
              )}

              {historyError && (
                <Alert variant="destructive">
                  <AlertTitle>과거 기록을 모두 불러오지 못했습니다</AlertTitle>
                  <AlertDescription>
                    {historyError} 최근 {RECENT_TRADES_WINDOW_MONTHS}개월 기록만으로 비교합니다.
                  </AlertDescription>
                </Alert>
              )}

              {aptAddress && (
                <Field>
                  <FieldLabel>단지 위치</FieldLabel>
                  <AptLocationMap address={aptAddress} />
                </Field>
              )}

              {aptName && (
                <Field>
                  <FieldLabel>전용면적(㎡)</FieldLabel>
                  <Select
                    items={areaSelectItems}
                    value={area}
                    onValueChange={(next) => handleAreaChange(next as number | null)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="평형을 선택해 주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {areaSelectItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}

              {area !== null && (
                <Field>
                  <FieldLabel>매수 연도</FieldLabel>
                  <Select
                    items={yearSelectItems}
                    value={year}
                    onValueChange={(next) => setYear(next as number | null)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="실제 거래가 있었던 연도만 표시됩니다" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {yearSelectItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}

              {year !== null && (
                <Field>
                  <FieldLabel htmlFor="monthly-salary">월급(만원, 선택)</FieldLabel>
                  <Input
                    id="monthly-salary"
                    type="number"
                    inputMode="numeric"
                    placeholder="예: 300"
                    value={salaryInput}
                    onChange={(event) => setSalaryInput(event.target.value)}
                  />
                  <FieldDescription>입력하면 차액을 월급 몇 년치로 환산해 보여드립니다.</FieldDescription>
                </Field>
              )}
            </FieldGroup>
          </CardContent>
        </Card>

        {noComparison && (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>비교할 수 없습니다</EmptyTitle>
              <EmptyDescription>이 평형은 최근 실거래 기록이 없어 현재 시세를 확인할 수 없습니다.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {result && latest && year !== null && (
          <Card>
            <CardHeader>
              <CardTitle>
                {year}년에 샀다면 지금 {result.diffAmount >= 0 ? "+" : ""}
                {formatManwon(result.diffAmount)}
              </CardTitle>
              <CardDescription>
                {year}년 평균 매매가 {formatManwon(pastAmount ?? 0)} → 최근 실거래가 {formatManwon(latest.dealAmount)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <EverydayComparisonList amountInManwon={Math.abs(result.diffAmount)} />
              {result.yearsOfSalary !== undefined && (
                <>
                  <p className="text-lg font-medium">
                    월급 {Math.abs(result.yearsOfSalary).toFixed(1)}년치
                    {result.yearsOfSalary < 0 ? "를 손해 봤네요" : "입니다"}
                  </p>
                  <RegretMinerAnimation years={Math.abs(result.yearsOfSalary)} />
                </>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
