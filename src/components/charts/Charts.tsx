import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, G, Line, Rect, Text as SvgText } from "react-native-svg";
import { colors } from "@/theme";
import { Txt } from "@/components/ui/Txt";

export interface BarDatum { label: string; value: number }

/** Biểu đồ cột (thay recharts BarChart) */
export function BarChart({ data, height = 240, color = colors.primary }: { data: BarDatum[]; height?: number; color?: string }) {
  const [w, setW] = useState(0);
  const padL = 30, padB = 26, padT = 10, padR = 8;
  const max = Math.max(1, ...data.map((d) => d.value));
  const niceMax = Math.max(1, Math.ceil(max / 4) * 4);
  const ticks = [0, 1, 2, 3, 4].map((i) => (niceMax / 4) * i);
  const plotW = Math.max(0, w - padL - padR);
  const plotH = height - padT - padB;
  const slot = data.length ? plotW / data.length : 0;
  const barW = Math.min(44, slot * 0.6);

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ width: "100%" }}>
      {w > 0 ? (
        <Svg width={w} height={height}>
          {ticks.map((t) => {
            const y = padT + plotH - (t / niceMax) * plotH;
            return (
              <G key={t}>
                <Line x1={padL} x2={w - padR} y1={y} y2={y} stroke={colors.border} strokeDasharray="3 3" strokeWidth={1} />
                <SvgText x={padL - 6} y={y + 4} fontSize={10} fill={colors.mutedFg} textAnchor="end">{Number.isInteger(t) ? t : t.toFixed(1)}</SvgText>
              </G>
            );
          })}
          {data.map((d, i) => {
            const h = (d.value / niceMax) * plotH;
            const x = padL + slot * i + (slot - barW) / 2;
            return (
              <G key={d.label + i}>
                <Rect x={x} y={padT + plotH - h} width={barW} height={h} rx={5} fill={color} />
                {d.value > 0 ? (
                  <SvgText x={x + barW / 2} y={padT + plotH - h - 4} fontSize={10} fill={colors.foreground} textAnchor="middle" fontWeight="700">{d.value}</SvgText>
                ) : null}
                <SvgText x={x + barW / 2} y={height - 8} fontSize={10} fill={colors.mutedFg} textAnchor="middle">{d.label}</SvgText>
              </G>
            );
          })}
        </Svg>
      ) : null}
    </View>
  );
}

export interface SliceDatum { name: string; value: number; color: string }

/** Biểu đồ vành khuyên (thay recharts PieChart) kèm chú giải */
export function DonutChart({ data, size = 180 }: { data: SliceDatum[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const stroke = 34;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <View style={{ alignItems: "center", gap: 14 }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.muted} strokeWidth={stroke} fill="none" />
          {total > 0
            ? data.map((d) => {
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
        <SvgText x={size / 2} y={size / 2 + 6} fontSize={20} fontWeight="700" fill={colors.foreground} textAnchor="middle">{total}</SvgText>
      </Svg>
      <View style={{ gap: 6, alignSelf: "stretch" }}>
        {data.map((d) => (
          <View key={d.name} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: d.color }} />
            <Txt variant="small">{d.name}: <Txt variant="small" bold>{d.value}</Txt></Txt>
          </View>
        ))}
      </View>
    </View>
  );
}
