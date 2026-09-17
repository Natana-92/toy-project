/** 서울특별시 25개 자치구와 법정동코드(시군구 5자리). */
export type SeoulDistrict = {
  name: string;
  code: string;
};

export const SEOUL_DISTRICTS: SeoulDistrict[] = [
  { name: "종로구", code: "11110" },
  { name: "중구", code: "11140" },
  { name: "용산구", code: "11170" },
  { name: "성동구", code: "11200" },
  { name: "광진구", code: "11215" },
  { name: "동대문구", code: "11230" },
  { name: "중랑구", code: "11260" },
  { name: "성북구", code: "11290" },
  { name: "강북구", code: "11305" },
  { name: "도봉구", code: "11320" },
  { name: "노원구", code: "11350" },
  { name: "은평구", code: "11380" },
  { name: "서대문구", code: "11410" },
  { name: "마포구", code: "11440" },
  { name: "양천구", code: "11470" },
  { name: "강서구", code: "11500" },
  { name: "구로구", code: "11530" },
  { name: "금천구", code: "11545" },
  { name: "영등포구", code: "11560" },
  { name: "동작구", code: "11590" },
  { name: "관악구", code: "11620" },
  { name: "서초구", code: "11650" },
  { name: "강남구", code: "11680" },
  { name: "송파구", code: "11710" },
  { name: "강동구", code: "11740" },
];

export function isValidSeoulDistrictCode(code: string): boolean {
  return SEOUL_DISTRICTS.some((district) => district.code === code);
}
