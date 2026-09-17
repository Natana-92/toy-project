`app/page.tsx`의 `noComparison`은 매수 연도 선택지 자체가 실제 거래 연도에서만 나오기 때문에 현재 로직상 항상 false라 "비교 불가" Empty 화면이 트리거되지 않는다(제거하거나, latestDeal에 유효기간 조건을 추가해 의미를 되살릴지 결정 필요).
