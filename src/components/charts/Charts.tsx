import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { colors } from "@/theme";
import { Txt } from "@/components/ui/Txt";

export interface BarDatum { label: string; value: number }

const AXIS = "#666666"; // màu mặc định của recharts

/** Biểu đồ cột giống recharts BarChart: lưới 3 3 mờ, cột bo góc trên 6px, trục Y số nguyên, bấm cột để xem tooltip */
export function BarChart({
  data, height = 260, color = colors.primary, seriesName = "value",
}: { data: BarDatum[]; height?: number; color?: string; seriesName?: string }) {
  const [w, setW] = useState(0);
  const [sel, setSel] = useState<number | null>(null);

  const padL = 40, padR = 10, padT = 10, padB = 30;
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = Math.max(1, Math.ceil(max / 5)); // allowDecimals={false}
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let t = 0; t <= top; t += step) ticks.push(t);

  const plotW = Math.max(0, w - padL - padR);
  const plotH = height - padT - padB;
  const slot = data.length ? plotW / data.length : 0;
  const barW = slot * 0.8; // barCategoryGap 10%
  const labelEvery = Math.max(1, Math.ceil(52 / Math.max(slot, 1)));
  const yOf = (v: number) => padT + plotH - (v / top) * plotH;

  const barPath = (x: number, y: number, bw: number, h: number) => {
    const r = Math.min(6, bw / 2, h);
    return `M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + bw - r},${y} Q${x + bw},${y} ${x + bw},${y + r} L${x + bw},${y + h} Z`;
  };

  const s = sel !== null ? data[sel] : null;
  const tipLeft = s && sel !== null ? Math.min(Math.max(padL + slot * sel + slot / 2 - 60, 0), Math.max(w - 120, 0)) : 0;
  const tipTop = s ? Math.max(yOf(s.value) - 56, 0) : 0;

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ width: "100%" }}>
      {w > 0 ? (
        <>
          <Svg width={w} height={height}>
            {/* lưới ngang nét đứt mờ */}
            {ticks.map((t) => (
              <Line key={`g${t}`} x1={padL} x2={w - padR} y1={yOf(t)} y2={yOf(t)} stroke="#cccccc" strokeOpacity={0.3} strokeDasharray="3 3" strokeWidth={1} />
            ))}
            {/* lưới dọc */}
            {data.map((_, i) => (
              <Line key={`v${i}`} x1={padL + slot * i} x2={padL + slot * i} y1={padT} y2={padT + plotH} stroke="#cccccc" strokeOpacity={0.3} strokeDasharray="3 3" strokeWidth={1} />
            ))}
            <Line x1={w - padR} x2={w - padR} y1={padT} y2={padT + plotH} stroke="#cccccc" strokeOpacity={0.3} strokeDasharray="3 3" strokeWidth={1} />

            {/* trục */}
            <Line x1={padL} x2={padL} y1={padT} y2={padT + plotH} stroke={AXIS} strokeWidth={1} />
            <Line x1={padL} x2={w - padR} y1={padT + plotH} y2={padT + plotH} stroke={AXIS} strokeWidth={1} />

            {ticks.map((t) => (
              <G key={`y${t}`}>
                <Line x1={padL - 6} x2={padL} y1={yOf(t)} y2={yOf(t)} stroke={AXIS} strokeWidth={1} />
                <SvgText x={padL - 9} y={yOf(t) + 4} fontSize={12} fill={AXIS} textAnchor="end">{t}</SvgText>
              </G>
            ))}

            {data.map((d, i) => {
              const x = padL + slot * i + (slot - barW) / 2;
              const y = yOf(d.value);
              const h = padT + plotH - y;
              const cx = padL + slot * i + slot / 2;
              return (
                <G key={d.label + i}>
                  <Line x1={cx} x2={cx} y1={padT + plotH} y2={padT + plotH + 6} stroke={AXIS} strokeWidth={1} />
                  {i % labelEvery === 0 ? (
                    <SvgText x={cx} y={padT + plotH + 20} fontSize={12} fill={AXIS} textAnchor="middle">{d.label}</SvgText>
                  ) : null}
                  {/* vùng bấm rộng cả cột + cột hiển thị */}
                  <Rect x={padL + slot * i} y={padT} width={slot} height={plotH} fill="transparent" onPress={() => setSel(sel === i ? null : i)} />
                  {h > 0 ? <Path d={barPath(x, y, barW, h)} fill={color} opacity={sel === i ? 0.85 : 1} onPress={() => setSel(sel === i ? null : i)} /> : null}
                </G>
              );
            })}
          </Svg>

          {/* tooltip giống recharts: nền trắng, viền xám, nhãn + "series : giá trị" */}
          {s ? (
            <View
              pointerEvents="none"
              style={{
                position: "absolute", left: tipLeft, top: tipTop, minWidth: 100, paddingHorizontal: 10, paddingVertical: 8,
                backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc",
              }}
            >
              <Txt size={13} lh={18} color="#000">{s.label}</Txt>
              <Txt size={13} lh={18} color={color}>{seriesName} : {s.value}</Txt>
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

export interface SliceDatum { name: string; value: number; color: string }

/**
 * Biểu đồ vành khuyên giống recharts Pie (innerRadius 45, outerRadius 80).
 * recharts vẽ lát đầu tiên từ vị trí 3 giờ và quay NGƯỢC chiều kim đồng hồ.
 */
export function DonutChart({ data, size = 220, inner = 45, outer = 80 }: { data: SliceDatum[]; size?: number; inner?: number; outer?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const stroke = outer - inner;
  const r = (outer + inner) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={size} height={size}>
        {/* lật dọc để chiều quay thành ngược kim đồng hồ, bắt đầu từ 3 giờ */}
        <G transform={`translate(0, ${size}) scale(1, -1)`}>
          {total > 0
            ? data.map((d) => {
                if (d.value <= 0) return null;
                const len = (d.value / total) * c;
                const el = (
                  <Circle
                    key={d.name}
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    stroke={d.color}
                    strokeWidth={stroke}
                    fill="none"
                    strokeDasharray={`${len} ${c - len}`}
                    strokeDashoffset={-offset}
                  />
                );
                offset += len;
                return el;
              })
            : null}
        </G>
      </Svg>
    </View>
  );
}
