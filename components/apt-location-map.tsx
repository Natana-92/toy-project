"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (callback: () => void) => void;
        LatLng: new (lat: number, lng: number) => unknown;
        Map: new (container: HTMLElement, options: { center: unknown; level: number }) => unknown;
        Marker: new (options: { position: unknown; map: unknown }) => unknown;
      };
    };
  }
}

type GeoPoint = { lat: number; lng: number };

const KAKAO_SDK_SCRIPT_ID = "kakao-maps-sdk";

/** 아파트 단지 주소로 좌표를 조회해 카카오맵에 위치를 표시한다.
 * address가 바뀌면 내부 상태를 완전히 새로 시작하도록 key로 리마운트한다. */
export function AptLocationMap({ address }: { address: string }) {
  return <AptLocationMapForAddress key={address} address={address} />;
}

function AptLocationMapForAddress({ address }: { address: string }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(() => typeof window !== "undefined" && !!window.kakao);
  const [point, setPoint] = useState<GeoPoint | null | undefined>(undefined);

  const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: GeoPoint | null) => {
        if (!cancelled) setPoint(data);
      })
      .catch(() => {
        if (!cancelled) setPoint(null);
      });

    return () => {
      cancelled = true;
    };
  }, [address]);

  // next/script의 자동 프리페치(fetch)가 카카오 CDN과 충돌해 조용히 실패하는 문제가 있어,
  // 표준 DOM API로 직접 스크립트를 삽입한다.
  useEffect(() => {
    if (!jsKey || scriptLoaded) return;

    const existing = document.getElementById(KAKAO_SDK_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.id = KAKAO_SDK_SCRIPT_ID;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${jsKey}&autoload=false`;
    script.async = true;
    script.addEventListener("load", () => setScriptLoaded(true));
    document.head.appendChild(script);
  }, [jsKey, scriptLoaded]);

  useEffect(() => {
    if (!scriptLoaded || !point || !mapContainerRef.current || !window.kakao) return;

    window.kakao.maps.load(() => {
      if (!mapContainerRef.current || !window.kakao) return;
      const center = new window.kakao.maps.LatLng(point.lat, point.lng);
      const map = new window.kakao.maps.Map(mapContainerRef.current, { center, level: 3 });
      new window.kakao.maps.Marker({ position: center, map });
    });
  }, [scriptLoaded, point]);

  if (!jsKey) {
    return (
      <Alert variant="destructive">
        <AlertTitle>지도를 표시할 수 없습니다</AlertTitle>
        <AlertDescription>서버에 카카오맵 JavaScript 키(NEXT_PUBLIC_KAKAO_JS_KEY)가 설정되어 있지 않습니다.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {point === undefined && <Skeleton className="h-56 w-full rounded-2xl" />}

      {point === null && (
        <Empty className="rounded-2xl border-dashed py-8">
          <EmptyTitle>위치를 찾을 수 없습니다</EmptyTitle>
          <EmptyDescription>이 단지의 주소로는 지도 위치를 확인할 수 없습니다.</EmptyDescription>
        </Empty>
      )}

      <div ref={mapContainerRef} className={point ? "h-56 w-full rounded-2xl" : "hidden"} />
    </div>
  );
}
