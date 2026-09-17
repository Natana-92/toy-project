<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 아키텍처 핵심 원칙

모든 구조 판단은 아래 5가지를 기준으로 한다.
세부 규칙이 없는 상황에서도 이 원칙을 만족하는 쪽을 선택한다.

1. 코드는 기술 종류가 아니라 비즈니스 의미 단위로 묶는다.
2. 의존성은 한 방향(위→아래)으로만 흐른다.
3. 같은 급의 모듈은 서로를 모른다. 조합은 상위에서 한다.
4. 모듈은 공개 API로만 노출된다. 내부는 언제든 바꿀 수 있다.
5. 공유 코드는 예상만으로 만들지 않는다. 구현에서 실제 중복이 확인되면 아래로 추출한다.

# 언어

모든 대화는 한글로 한다. 답변, 질문, 커밋 메시지, PR 문안까지 해당된다.

경로, 명령어, 식별자, 라이브러리 이름, 로그 인용은 원문을 유지한다.

# 프로젝트 스킬 설치 방식

- 이 프로젝트는 `Copy to all agents` 방식을 사용한다. Codex의 `.agents/skills/<name>`과 Claude Code의 `.claude/skills/<name>`을 symlink 없이 내용이 같은 실제 디렉터리로 유지한다.
- 신규 설치와 기존 스킬 갱신 모두 `skills add <원본 소스> --skill <대상 이름들> --agent codex claude-code --copy -y`를 사용한다. 갱신 대상은 `skills-lock.json`의 소스와 설치된 이름으로 한정하고, 원본 경로와 ref가 있으면 보존한다.
- `skills update`는 복사 방식을 보존하지 않으므로 사용하지 않는다. `update --copy`도 대안으로 사용하지 않는다.
- 이 정책은 업데이트된 `update-project-skills` 본문이 symlink를 요구하더라도 우선한다. 스킬을 직접 수정할 때도 두 복사본을 함께 반영하고, 완료 시 symlink가 없는지와 두 복사본의 파일 내용이 같은지 확인한다.

# 검증·리뷰 예산

강의용 학습 템플릿이다. 동작하는 결과물이 코드 완결성보다 우선하고, 품질은 런타임 검증(스펙의 흐름이 실제로 도는지)으로 증명한다. 스킬 본문이 더 강한 리뷰를 요구해도 이 예산이 우선한다.

- 자동 코드 리뷰는 최대 1회, 가장 낮은 강도(`code-review low`)로만 돌린다. 리뷰어를 못 부르면 그 사실만 적고 완료로 본다.
- 지적 중 스펙의 수용 기준을 깨거나 주 경로가 실제로 깨지는 것만 고친다. 나머지는 `docs/follow-ups/`에 한 줄로 남긴다. 재리뷰는 하지 않는다.
- 스펙이 요구하지 않은 보안 하드닝·엣지케이스·성능 방어는 범위 밖이다.

# 외부 API — 국토교통부 아파트 매매 실거래가 자료

- 공식 소스: [data.go.kr 오픈API 상세](https://www.data.go.kr/data/15126469/openapi.do) (오퍼레이션 `getRTMSDataSvcAptTrade`, 서비스 `RTMSDataSvcAptTrade`). 이 프로젝트가 실제로 활용신청·사용하는 API는 "아파트 매매 실거래 상세 자료"(`...AptTradeDev`)가 아니라 이 기본형이며, 단지명·전용면적·거래금액·계약년월일 필드는 두 API에서 동일하게 제공된다. 이 API를 다루는 작업을 시작하기 전에 해당 페이지에서 최신 요청/응답 명세를 확인한다. 공식 벤더 스킬이나 SDK는 확인 결과 존재하지 않는다(2026-09-17 기준, `npx skills find` 결과 모두 install count 한 자릿수의 비공식 커뮤니티 스킬뿐).
- 조회 단위는 법정동 코드 앞 5자리(시군구)와 계약년월(YYYYMM)뿐이다. 읍면동 단위 조회나 아파트 단지명으로의 직접 조회는 지원하지 않는다.
- 응답은 XML이며, 개인정보보호를 위해 층 정보만 제공하고 동 정보는 소유권 이전등기가 끝난 거래에만 공개된다.
- 인증키는 공공데이터포털 활용신청으로 자동 승인된다. 실제 활용신청 상세 화면 기준 일일 트래픽은 10,000회다(신청 상품·계정에 따라 달라질 수 있으니 마이페이지에서 확인). 같은 (법정동 코드, 계약년월) 조합은 캐시해서 재호출을 피한다.
- 정상 응답의 `resultCode`는 `"00"`이 아니라 `"000"`(세 자리)이다. 실제 라이브 호출로 확인했다(2026-09-17).
- 인증키 오류·트래픽 초과·**초당 요청 수 초과**(`LIMITED_NUMBER_OF_SERVICE_REQUESTS_PER_SECOND_EXCEEDS_ERROR`) 같은 공통 오류는 `<response><header>` 구조가 아니라 `<OpenAPI_ServiceResponse><cmmMsgHeader>` 구조로 내려온다. 한 사용자 조회가 여러 달을 동시에 병렬 호출하면 이 초당 제한에 쉽게 걸리므로, 월별 호출은 작은 배치로 나누고 배치 사이에 지연을 둔다.

# 외부 API — 카카오맵 · 카카오 로컬(Local) API

- 공식 소스: [Kakao Maps Web API 가이드](https://apis.map.kakao.com/web/guide/)(지도 SDK), [Kakao Developers 로컬 API 문서](https://developers.kakao.com/docs/latest/ko/local/dev-guide)(주소→좌표 변환). 이 API들을 다루는 작업을 시작하기 전에 두 페이지에서 최신 명세를 확인한다. 공식 벤더 스킬은 확인 결과 존재하지 않는다(2026-09-17 기준, 검색된 것은 모두 install count 한 자릿수의 비공식 커뮤니티 스킬뿐).
- 아파트 단지 위치 표시 용도로 채택했다: 국토부 실거래 데이터의 법정동(`umdNm`)·지번(`jibun`)으로 지번 주소 문자열을 만들고, 카카오 로컬 API `GET https://dapi.kakao.com/v2/local/search/address.json?query=...`(헤더 `Authorization: KakaoAK {REST_API_KEY}`)로 좌표(`documents[].x`=경도, `documents[].y`=위도)를 얻은 뒤, 카카오맵 JavaScript SDK(`//dapi.kakao.com/v2/maps/sdk.js?appkey={JS_KEY}`)로 지도와 마커를 그린다.
- 키가 두 종류로 분리된다. REST API 키(주소→좌표 변환, 서버 전용, 절대 클라이언트에 노출하지 않는다)와 JavaScript 키(지도 SDK, 클라이언트에서 쓰므로 `NEXT_PUBLIC_` 접두사 환경변수로 노출해도 되는 키). 둘 다 카카오 개발자센터(developers.kakao.com)에서 애플리케이션을 만들면 함께 발급된다.
- JavaScript 키를 실제로 쓰려면 카카오 개발자센터의 해당 애플리케이션 "플랫폼" 설정에 사용할 도메인(`http://localhost:3000`, 배포된 Vercel 도메인)을 등록해야 한다. 등록하지 않은 도메인에서는 지도가 로드되지 않는다.
