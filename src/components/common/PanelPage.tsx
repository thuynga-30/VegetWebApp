import { Screen } from "@/components/ui/Screen";
import { useLayout } from "@/hooks/useLayout";

/** <main className="p-6"> + space-y-6: trang con của khu vực Seller / Admin */
export function PanelPage({ children, onRefresh, refreshing }: { children: React.ReactNode; onRefresh?: () => void; refreshing?: boolean }) {
  const { isMd } = useLayout();
  return (
    <Screen
      maxWidth={100000}
      contentStyle={{ padding: isMd ? 24 : 16, gap: 24 }}
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      {children}
    </Screen>
  );
}
