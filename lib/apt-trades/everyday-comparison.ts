export type EverydayComparison = {
  label: string;
  emoji: string;
  count: number;
};

const EVERYDAY_ITEMS = [
  { label: "자장면", emoji: "🍜", unitPriceInManwon: 0.7 },
  { label: "치킨", emoji: "🍗", unitPriceInManwon: 2 },
  { label: "피자", emoji: "🍕", unitPriceInManwon: 2.5 },
];

/** 금액(만원)을 자장면·치킨 같은 일상 소비 단위 개수로 환산한다. */
export function listEverydayComparisons(amountInManwon: number): EverydayComparison[] {
  return EVERYDAY_ITEMS.map((item) => ({
    label: item.label,
    emoji: item.emoji,
    count: amountInManwon / item.unitPriceInManwon,
  }));
}
