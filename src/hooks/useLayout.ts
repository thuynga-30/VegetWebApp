import { useWindowDimensions } from "react-native";
import { WIDE_BREAKPOINT } from "@/theme";

/** Điểm ngắt giống Tailwind: md = 768px */
export function useLayout() {
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT; // md trở lên
  return { width, isWide, isMd: isWide, isMedium: width >= 600, columns: isWide ? 4 : 2 };
}
