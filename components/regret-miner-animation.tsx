import type { CSSProperties } from "react";

const CYCLE = "0.9s";
const EASE = "0.45 0 0.55 1";

const CALENDAR_MONTHS = ["1", "2", "3", "4", "5"];

const SWEAT_DROPS = [
  { x: 56, y: 29, scale: 1.2, dx: "-13px", dy: "-10px", delay: "0s" },
  { x: 94, y: 41, scale: 1.05, dx: "13px", dy: "-6px", delay: "-0.13s" },
  { x: 52, y: 46, scale: 0.95, dx: "-15px", dy: "3px", delay: "-0.28s" },
];

const ROCK_CHIPS = [
  { x: 110, y: 104, dx: "-16px", dy: "-20px", rotate: "170deg" },
  { x: 127, y: 106, dx: "18px", dy: "-15px", rotate: "-150deg" },
  { x: 118, y: 99, dx: "1px", dy: "-24px", rotate: "220deg" },
];

const SHIRT = "oklch(0.63 0.135 45)";
const SHIRT_SHADE = "oklch(0.55 0.12 42)";
const DENIM = "oklch(0.46 0.075 250)";
const DENIM_DARK = "oklch(0.38 0.06 250)";
const SKIN = "oklch(0.83 0.055 62)";
const SKIN_SHADE = "oklch(0.75 0.065 55)";
const HELMET = "oklch(0.79 0.16 80)";
const HELMET_SHADE = "oklch(0.71 0.15 78)";
const BOOT = "oklch(0.33 0.02 60)";
const GLOVE = "oklch(0.68 0.05 70)";
const INK = "oklch(0.3 0.02 60)";

/** 광부가 땀 흘리며 곡괭이질하는 동안 뒤에서 달력이 한 장씩 뜯겨 날아가는 것으로
 * "몇 년치를 일해야 하는지"를 시각화하는 장식용 애니메이션.
 * 회전·확대는 SVG 좌표계를 그대로 쓰는 animateTransform으로, 이동·페이드는 CSS로 처리한다. */
export function RegretMinerAnimation({ years }: { years: number }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-muted/50 px-3 pb-2 pt-3">
      <div className="flex items-center justify-between gap-2">
        <svg
          viewBox="28 6 142 130"
          className="h-44 min-w-0 flex-1 text-foreground"
          role="img"
          aria-label="땀 흘리며 곡괭이질하는 광부"
        >
        {/* 지면 */}
        <line
          x1="8"
          y1="132"
          x2="196"
          y2="132"
          stroke="currentColor"
          strokeOpacity="0.16"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* 캐내는 바위 */}
        <path d="M105 132 L112 113 L127 107 L142 115 L147 132 Z" fill="oklch(0.6 0.012 70)" />
        <path d="M112 113 L127 107 L129 119 L115 121 Z" fill="oklch(0.69 0.012 70)" />
        <circle cx="153" cy="129" r="4.5" fill="oklch(0.6 0.012 70)" />

        {/* 타격 먼지 */}
        {[0, -0.11].map((delay, index) => (
          <g key={index} transform="translate(118 116)">
            <ellipse
              rx="18"
              ry="6.5"
              fill="oklch(0.74 0.02 80)"
              style={{ animation: `miner-dust-fade ${CYCLE} ease-out infinite`, animationDelay: `${delay}s` }}
            >
              <animateTransform
                attributeName="transform"
                type="scale"
                values="0.3;0.3;1;2"
                keyTimes="0;0.3;0.38;1"
                dur={CYCLE}
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
            </ellipse>
          </g>
        ))}

        {/* 광부 전체: 내려칠 때 살짝 내려앉고 앞으로 숙임 */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0;0 4;0 2;0 0"
            keyTimes="0;0.34;0.48;1"
            dur={CYCLE}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines={`${EASE};${EASE};${EASE}`}
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 75 130;5 75 130;2 75 130;0 75 130"
            keyTimes="0;0.34;0.48;1"
            dur={CYCLE}
            repeatCount="indefinite"
            additive="sum"
            calcMode="spline"
            keySplines={`${EASE};${EASE};${EASE}`}
          />

          {/* 뒷다리 */}
          <polyline
            points="64,94 55,112 57,124"
            fill="none"
            stroke={DENIM_DARK}
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="43" y="122" width="24" height="10" rx="4" fill={BOOT} />

          {/* 뒤쪽 팔 */}
          <polyline
            points="58,64 42,74 47,90"
            fill="none"
            stroke={SHIRT_SHADE}
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="47" cy="91" r="6" fill={GLOVE} />

          {/* 몸통: 셔츠 + 멜빵바지 */}
          <rect x="54" y="52" width="40" height="46" rx="15" fill={SHIRT} />
          <path d="M84 54 L94 60 L94 92 L84 96 Z" fill={SHIRT_SHADE} opacity="0.5" />
          <path d="M64 54 L67 74" stroke={DENIM} strokeWidth="6" strokeLinecap="round" />
          <path d="M85 54 L82 74" stroke={DENIM} strokeWidth="6" strokeLinecap="round" />
          <rect x="58" y="70" width="32" height="30" rx="9" fill={DENIM} />
          <rect x="66" y="78" width="16" height="12" rx="3" fill={DENIM_DARK} opacity="0.65" />

          {/* 앞다리 */}
          <polyline
            points="85,94 97,110 101,124"
            fill="none"
            stroke={DENIM}
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="92" y="122" width="25" height="10" rx="4" fill={BOOT} />

          {/* 머리 */}
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="-3 75 50;7 75 50;2 75 50;-3 75 50"
              keyTimes="0;0.34;0.5;1"
              dur={CYCLE}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines={`${EASE};${EASE};${EASE}`}
            />

            <rect x="68" y="44" width="15" height="12" rx="5" fill={SKIN_SHADE} />
            <ellipse cx="75" cy="33" rx="16.5" ry="15.5" fill={SKIN} />
            <circle cx="60" cy="36" r="3.8" fill={SKIN_SHADE} />
            <path d="M89 32 L96 36.5 L89 41 Z" fill={SKIN_SHADE} />

            {/* 힘든 표정 */}
            <path d="M78 36 Q82.5 40.5 87 36" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M64 36 Q67.5 39.5 71 36" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M78 29.5 L87.5 32" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M63 32 L71 29.5" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <ellipse cx="67" cy="44" rx="5" ry="3" fill="oklch(0.68 0.13 25)" opacity="0.38" />
            <g transform="translate(79 45.5)">
              <ellipse rx="4" ry="3.2" fill="oklch(0.34 0.055 25)">
                <animateTransform
                  attributeName="transform"
                  type="scale"
                  values="1 1;1 0.35;1 1.35;1 1"
                  keyTimes="0;0.34;0.7;1"
                  dur={CYCLE}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines={`${EASE};${EASE};${EASE}`}
                />
              </ellipse>
            </g>

            {/* 안전모 */}
            <path d="M57 30 A18.5 17 0 0 1 94 30 L94 32 L57 32 Z" fill={HELMET} />
            <path d="M88 27 L108 26 L108 32 L88 33 Z" fill={HELMET_SHADE} />
            <path d="M75 14 L75 30" stroke={HELMET_SHADE} strokeWidth="2.8" strokeLinecap="round" />

            {/* 헤드램프 */}
            <circle cx="101" cy="24" r="4.4" fill="oklch(0.5 0.02 250)" />
            <circle cx="101" cy="24" r="2.4" fill="oklch(0.93 0.16 95)" />
            <path
              d="M105 24 L124 19 L124 31 Z"
              fill="oklch(0.93 0.16 95)"
              style={{ animation: `miner-lamp-flicker ${CYCLE} ease-in-out infinite`, opacity: 0.16 }}
            />

            {/* 땀방울 */}
            {SWEAT_DROPS.map((drop, index) => (
              <g key={index} transform={`translate(${drop.x} ${drop.y}) scale(${drop.scale})`}>
                <path
                  d="M0 0 C-3.6 4.8 -3.6 8.6 0 9.2 C3.6 8.6 3.6 4.8 0 0 Z"
                  fill="oklch(0.7 0.13 232)"
                  style={
                    {
                      animation: `miner-sweat-fly ${CYCLE} ease-out infinite`,
                      animationDelay: drop.delay,
                      "--sweat-x": drop.dx,
                      "--sweat-y": drop.dy,
                    } as CSSProperties
                  }
                />
              </g>
            ))}
          </g>

          {/* 곡괭이 쥔 팔 */}
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="-82 90 62;16 90 62;6 90 62;-26 90 62;-82 90 62"
              keyTimes="0;0.34;0.44;0.62;1"
              dur={CYCLE}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines={`${EASE};${EASE};${EASE};${EASE}`}
            />

            <line x1="96" y1="66" x2="129" y2="99" stroke="oklch(0.53 0.08 55)" strokeWidth="6.5" strokeLinecap="round" />
            <g transform="translate(129 99) rotate(45)">
              <path
                d="M-16 -2.5 Q-7 -6 0 -5.2 Q7 -6 16 -2.5 L13 3 Q7 0.5 0 0.5 Q-7 0.5 -13 3 Z"
                fill="oklch(0.66 0.012 250)"
              />
              <path d="M-4 -5.5 L4 -5.5 L4 3.5 L-4 3.5 Z" fill="oklch(0.42 0.015 250)" />
            </g>
            <polyline
              points="90,62 101,72 112,83"
              fill="none"
              stroke={SHIRT}
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="113" cy="84" r="6.5" fill={GLOVE} />
          </g>
        </g>

        {/* 튀는 돌 파편 */}
        {ROCK_CHIPS.map((chip, index) => (
          <g key={index} transform={`translate(${chip.x} ${chip.y})`}>
            <path
              d="M0 0 L7 2.4 L5 8 L-1.4 6.2 Z"
              fill="oklch(0.5 0.016 70)"
              style={
                {
                  animation: `miner-chip-fly ${CYCLE} ease-out infinite`,
                  "--chip-x": chip.dx,
                  "--chip-y": chip.dy,
                  "--chip-rotate": chip.rotate,
                } as CSSProperties
              }
            />
          </g>
        ))}
        </svg>

        {/* 달력 더미 */}
        <div className="flex shrink-0 flex-col items-center pb-6">
          <div className="mb-[-3px] flex gap-3">
            <span className="h-3 w-1.5 rounded-full bg-muted-foreground/50" />
            <span className="h-3 w-1.5 rounded-full bg-muted-foreground/50" />
          </div>
          <div className="relative h-16 w-14">
            {CALENDAR_MONTHS.map((month, index) => (
              <div
                key={month}
                className="absolute inset-0 flex flex-col overflow-hidden rounded-[4px] border border-border bg-card shadow-sm"
                style={{
                  animation: `calendar-page-fly 2.7s ease-in infinite`,
                  animationDelay: `${index * -0.54}s`,
                  zIndex: CALENDAR_MONTHS.length - index,
                }}
              >
                <div className="flex h-2.5 w-full items-center justify-center gap-1 bg-destructive/75">
                  <span className="h-[3px] w-[3px] rounded-full bg-card/80" />
                  <span className="h-[3px] w-[3px] rounded-full bg-card/80" />
                </div>
                <div className="flex flex-1 items-center justify-center text-[11px] font-bold text-foreground">
                  {month}월
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-1 text-center text-xs text-muted-foreground">
        쉬지 않고 곡괭이질해도 {years.toFixed(1)}년어치입니다.
      </p>
    </div>
  );
}
