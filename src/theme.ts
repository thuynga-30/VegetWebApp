// Bảng màu quy đổi từ oklch trong index.css của bản web
export const colors = {
  background: "#fafbf2",
  foreground: "#0b2010",
  card: "#ffffff",
  primary: "#1b7e2a",
  primaryFg: "#fcfcf8",
  primaryGlow: "#5fbf49",
  primarySoft: "rgba(27,126,42,0.12)",
  secondary: "#e8efd8",
  muted: "#f2f3e8",
  mutedFg: "#5c675d",
  accent: "#dca400",
  destructive: "#df2225",
  destructiveSoft: "rgba(223,34,37,0.10)",
  border: "#dae1d3",
  input: "#e0e7da",
  earth: "#754a23",
  cream: "#fdf5df",
  trustBronze: "#be7e51",
  trustSilver: "#a3b0ba",
  trustGold: "#efb300",
  sidebar: "#15301b",
  sidebarFg: "#f2f3e4",
  sidebarAccent: "#214329",
  white: "#ffffff",
  black: "#000000",
  overlay: "rgba(0,0,0,0.6)",
  sidebarBorder: "rgba(33,67,41,0.5)",
  sidebarFgSoft: "rgba(242,243,228,0.8)",
  red500: "#ef4444",
  // màu trạng thái (Tailwind)
  blue100: "#dbeafe", blue700: "#1d4ed8",
  amber100: "#fef3c7", amber700: "#b45309", amber400: "#fbbf24",
  indigo100: "#e0e7ff", indigo700: "#4338ca",
  green100: "#dcfce7", green700: "#15803d",
  red100: "#fee2e2",
  slate600: "#475569",
};

// Khớp Tailwind của bản web: lg=12, xl=16 (đã ghi đè), 2xl=16, 3xl=24
export const radius = { sm: 8, md: 10, lg: 12, xl: 16, xxl: 16, xxxl: 24, full: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const MAX_WIDTH = 1280; // max-w-7xl
export const WIDE_BREAKPOINT = 768; // md

export const shadow = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;
