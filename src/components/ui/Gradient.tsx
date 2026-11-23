import { useState } from "react";
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { colors } from "@/theme";

/** `bg-hero-gradient`: linear-gradient(135deg, primary 0%, primary-glow 100%) — tính góc 135° chính xác theo kích thước */
export function HeroGradient({
  style, children, opacity = 1, glowAt,
}: {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  opacity?: number;
  /** vầng sáng trắng radial-gradient(circle at x% y%, rgba(255,255,255,.15), transparent) */
  glowAt?: { x: number; y: number; r?: number };
}) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });

  // CSS 135deg: hướng (sin, -cos) = (0.7071, 0.7071); độ dài đường gradient = (w + h) * 0.7071
  let start = { x: 0, y: 0 };
  let end = { x: 1, y: 1 };
  if (size.w > 0 && size.h > 0) {
    const d = Math.SQRT1_2;
    const len = (size.w + size.h) * d;
    const cx = size.w / 2;
    const cy = size.h / 2;
    start = { x: (cx - (d * len) / 2) / size.w, y: (cy - (d * len) / 2) / size.h };
    end = { x: (cx + (d * len) / 2) / size.w, y: (cy + (d * len) / 2) / size.h };
  }

  return (
    <View style={[{ overflow: "hidden" }, style]} onLayout={onLayout}>
      <LinearGradient
        colors={[colors.primary, colors.primaryGlow]}
        start={start}
        end={end}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity }}
      />
      {glowAt ? (
        <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          <Svg width="100%" height="100%" preserveAspectRatio="none">
            <Defs>
              <RadialGradient id="glow" cx={glowAt.x} cy={glowAt.y} rx={glowAt.r ?? 0.5} ry={glowAt.r ?? 0.5} gradientUnits="objectBoundingBox">
                <Stop offset="0" stopColor="#ffffff" stopOpacity={0.15} />
                <Stop offset="1" stopColor="#ffffff" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow)" />
          </Svg>
        </View>
      ) : null}
      {children}
    </View>
  );
}
