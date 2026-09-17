import { listEverydayComparisons } from "@/lib/apt-trades/everyday-comparison";

const UNIT_BY_LABEL: Record<string, string> = {
  자장면: "그릇",
  치킨: "마리",
};

/** 금액 차이를 자장면·치킨 같은 익숙한 소비 단위 개수로 보여준다. */
export function EverydayComparisonList({ amountInManwon }: { amountInManwon: number }) {
  const items = listEverydayComparisons(amountInManwon);

  return (
    <ul className="flex flex-wrap gap-3">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-sm shadow-sm ring-1 ring-foreground/5"
        >
          <span className="text-lg leading-none" aria-hidden="true">
            {item.emoji}
          </span>
          <span>
            {item.label} {Math.floor(item.count).toLocaleString("ko-KR")}
            {UNIT_BY_LABEL[item.label] ?? "개"}
          </span>
        </li>
      ))}
    </ul>
  );
}
