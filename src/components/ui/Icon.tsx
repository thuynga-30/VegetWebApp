import type { ComponentType } from "react";
import * as Lucide from "lucide-react-native";
import { colors } from "@/theme";

/** Tên icon (kebab-case) -> các tên export có thể có trong lucide-react-native (đề phòng đổi tên giữa các phiên bản) */
const MAP = {
  "arrow-right": ["ArrowRight"],
  "arrow-left": ["ArrowLeft"],
  "scan-line": ["ScanLine"],
  truck: ["Truck"],
  sprout: ["Sprout"],
  leaf: ["Leaf"],
  "map-pin": ["MapPin"],
  "shopping-cart": ["ShoppingCart"],
  "shopping-bag": ["ShoppingBag"],
  user: ["User"],
  menu: ["Menu"],
  "layout-dashboard": ["LayoutDashboard"],
  award: ["Award"],
  shield: ["Shield"],
  "shield-check": ["ShieldCheck"],
  "help-circle": ["HelpCircle", "CircleHelp"],
  "alert-circle": ["AlertCircle", "CircleAlert"],
  inbox: ["Inbox"],
  star: ["Star"],
  calendar: ["Calendar"],
  "trash-2": ["Trash2"],
  plus: ["Plus"],
  x: ["X"],
  check: ["Check"],
  upload: ["Upload"],
  "upload-cloud": ["UploadCloud", "CloudUpload"],
  "image-plus": ["ImagePlus"],
  package: ["Package"],
  "package-check": ["PackageCheck"],
  "package-search": ["PackageSearch"],
  phone: ["Phone"],
  mail: ["Mail"],
  "log-out": ["LogOut"],
  "chevron-down": ["ChevronDown"],
  search: ["Search"],
  save: ["Save"],
  "qr-code": ["QrCode"],
  printer: ["Printer"],
  download: ["Download"],
  copy: ["Copy"],
  "loader-2": ["Loader2", "LoaderCircle"],
  "check-square": ["CheckSquare", "SquareCheck"],
  "check-circle-2": ["CheckCircle2", "CircleCheck"],
  "x-circle": ["XCircle", "CircleX"],
  "trending-up": ["TrendingUp"],
  users: ["Users"],
  "sticky-note": ["StickyNote"],
  "zoom-in": ["ZoomIn"],
  "rotate-ccw": ["RotateCcw"],
  ban: ["Ban"],
  wallet: ["Wallet"],
  "credit-card": ["CreditCard"],
  "message-square": ["MessageSquare"],
  home: ["Home", "House"],
  "layout-grid": ["LayoutGrid", "Grid"],
  "bar-chart-3": ["BarChart3", "ChartColumn"],
  "clipboard-list": ["ClipboardList"],
    bell: ["Bell"],
} as const;

export type IconName = keyof typeof MAP;
/** tương thích tên cũ */
export type FeatherName = IconName;

const lib = Lucide as unknown as Record<string, ComponentType<any>>;

function resolve(name: IconName): ComponentType<any> | null {
  for (const n of MAP[name]) if (lib[n]) return lib[n];
  return lib.Circle ?? null;
}

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  /** độ dày nét (Lucide mặc định 2) */
  strokeWidth?: number;
  fill?: string;
  style?: any;
}

export function Icon({ name, size = 18, color = colors.foreground, strokeWidth = 2, fill, style }: Props) {
  const C = resolve(name);
  if (!C) return null;
  return <C size={size} color={color} strokeWidth={strokeWidth} fill={fill ?? "none"} style={style} />;
}
