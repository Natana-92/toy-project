`components/apt-location-map.tsx`가 `lib/apt-trades/kakao-geocoder.ts`에서 이미 export하는 `GeoPoint` 타입을 재사용하지 않고 동일한 모양(lat, lng)을 로컬로 재정의하고 있다(import해서 합치면 됨).
