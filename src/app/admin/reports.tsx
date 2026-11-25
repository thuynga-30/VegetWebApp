import { useMemo } from "react";
import { View } from "react-native";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { PanelPage } from "@/components/common/PanelPage";
import { BarChart, DonutChart } from "@/components/charts/Charts";
import { useFetch } from "@/hooks/useFetch";
import { useLayout } from "@/hooks/useLayout";
import { orderService } from "@/services/orderService";
import { batchService } from "@/services/batchService";

/** bg-card border rounded-2xl p-5 */
function Card({ title, children, flex }: { title: string; children: React.ReactNode; flex?: number }) {
  return (
    <View
      style={{
        flex, width: flex ? undefined : "100%", minWidth: 0, backgroundColor: colors.card, borderWidth: 1,
        borderColor: colors.border, borderRadius: radius.xxl, padding: 20,
      }}
    >
      <Txt size={16} lh={24} weight="600" style={{ marginBottom: 16 }}>{title}</Txt>
      {children}
    </View>
  );
}

export default function ReportsPage() {
  const { isMd } = useLayout();
  const { data: orders, refetch: ro } = useFetch(() => orderService.getAll(), []);
  const { data: batches, refetch: rb } = useFetch(() => batchService.getAllAdmin(), []);

  // Số đơn theo tháng, không tính đơn đã hủy/từ chối, sắp xếp theo thời gian tăng dần
  const monthly = useMemo(() => {
    if (!orders) return [];
    const map = new Map<string, number>();
    orders.forEach((o) => {
      if (o.status === "Cancelled") return;
      const d = new Date(o.created_at);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => {
        const [y, m] = key.split("-");
        return { label: `${m}/${y}`, value: count };
      });
  }, [orders]);

  const trustPie = useMemo(() => {
    if (!batches) return [];
    const count = { Low: 0, Medium: 0, High: 0 } as Record<string, number>;
    batches.forEach((b) => {
      count[b.trust_level] = (count[b.trust_level] ?? 0) + 1;
    });
    return [
      { name: "Vàng (Cấp 3)", value: count.High, color: colors.trustGold },
      { name: "Bạc (Cấp 2)", value: count.Medium, color: colors.trustSilver },
      { name: "Cơ bản (Cấp 1)", value: count.Low, color: colors.trustBronze },
    ];
  }, [batches]);

  return (
    <PanelPage onRefresh={() => { ro(); rb(); }}>
      <View style={{ flexDirection: isMd ? "row" : "column", alignItems: "flex-start", gap: 16 }}>
        <Card title="Đơn hàng theo tháng" flex={isMd ? 2 : undefined}>
          <BarChart data={monthly} height={260} seriesName="orders" />
        </Card>

        <Card title="Phân bố cấp độ tin cậy" flex={isMd ? 1 : undefined}>
          <DonutChart data={trustPie} />
          <View style={{ marginTop: 8, gap: 4 }}>
            {trustPie.map((t) => (
              <View key={t.name} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: t.color }} />
                <Txt size={12} lh={16} style={{ flex: 1 }}>{t.name}:</Txt>
                <Txt size={12} lh={16} weight="700">{t.value}</Txt>
              </View>
            ))}
          </View>
        </Card>
      </View>
    </PanelPage>
  );
}
