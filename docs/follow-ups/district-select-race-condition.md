`app/page.tsx`의 `handleDistrictChange`가 fire-and-forget으로 호출돼, 구를 빠르게 연속 변경하면 늦게 도착한 이전 요청 응답이 최신 선택 상태를 덮어쓸 수 있다(요청 순번 또는 AbortController로 방지 필요).
