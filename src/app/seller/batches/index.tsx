import { useState } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { Link, useRouter } from "expo-router";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { StatusBadge, TrustBadge } from "@/components/ui/Badges";
import { PanelPage } from "@/components/common/PanelPage";
import { useFetch } from "@/hooks/useFetch";
import { batchService } from "@/services/batchService";
import { formatDate } from "@/lib/format";
import type { BatchListItem } from "@/types/batch";

// Độ rộng cột (flex) của bảng
const COL = { product: 2.2, code: 1.5, harvest: 1.2, qty: 0.9, trust: 2.2, status: 1.1, action: 1.5 } as const;

function Cell({ w, children, right }: { w: number; children?: React.ReactNode; right?: boolean }) {
  return <View style={{ flex: w, padding: 12, justifyContent: "center", alignItems: right ? "flex-end" : "flex-start", minWidth: 0 }}>{children}</View>;
}

function QrButton({ b }: { b: BatchListItem }) {
  const router = useRouter();
  const [hover, setHover] = useState(false);
  const off = !b.barcode;
  return (
    <Pressable
      onPress={off ? undefined : () => router.push(`/seller/batches/${b.id}` as any)}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      accessibilityLabel={off ? "Chưa có mã QR" : "Mã QR"}
      style={{ padding: 6, borderRadius: 4, opacity: off ? 0.3 : 1, backgroundColor: hover && !off ? colors.muted : "transparent" }}
    >
      <Icon name="qr-code" size={16} />
    </Pressable>
  );
}

function DetailButton({ id }: { id: number }) {
  const [hover, setHover] = useState(false);
  return (
    <Link href={`/seller/batches/${id}`} asChild>
      <Pressable
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, backgroundColor: hover ? "rgba(27,126,42,0.2)" : "rgba(27,126,42,0.1)" }}
      >
        <Txt size={12} lh={16} weight="500" color={colors.primary}>Chi tiết</Txt>
      </Pressable>
    </Link>
  );
}

function TableRow({ b }: { b: BatchListItem }) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable
      accessible={false}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: hover ? "rgba(242,243,232,0.3)" : "transparent" }}
    >
      <Cell w={COL.product}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {b?.image ? <Img uri={b.image} style={{ width: 40, height: 40, borderRadius: radius.lg }} /> : null}
          <Txt size={14} lh={20} weight="500" style={{ flexShrink: 1 }}>{b.product_name}</Txt>
        </View>
      </Cell>
      <Cell w={COL.code}><Txt size={12} lh={16} mono>{b.barcode ?? "—"}</Txt></Cell>
      <Cell w={COL.harvest}><Txt size={14} lh={20}>{formatDate(b.harvest_date)}</Txt></Cell>
      <Cell w={COL.qty}><Txt size={14} lh={20}>{b.quantity} kg</Txt></Cell>
      <Cell w={COL.trust}><TrustBadge level={b.trust_level} size="sm" /></Cell>
      <Cell w={COL.status}><StatusBadge status={b.approval_status} /></Cell>
      <Cell w={COL.action} right>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <QrButton b={b} />
          <DetailButton id={b.id} />
        </View>
      </Cell>
    </Pressable>
  );
}

/** Điện thoại / màn hình hẹp: mỗi lô hàng là một thẻ */
function BatchCard({ b }: { b: BatchListItem }) {
  return (
    <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 16, gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {b?.image ? <Img uri={b.image} style={{ width: 48, height: 48, borderRadius: radius.lg }} /> : null}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt size={16} lh={24} weight="600" numberOfLines={1}>{b.product_name}</Txt>
          <Txt size={12} lh={16} mono muted>{b.barcode ?? "—"}</Txt>
        </View>
        <StatusBadge status={b.approval_status} />
      </View>
      <TrustBadge level={b.trust_level} size="sm" />
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Txt size={14} lh={20} muted>Thu hoạch {formatDate(b.harvest_date)} · Còn {b.quantity} kg</Txt>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <QrButton b={b} />
          <DetailButton id={b.id} />
        </View>
      </View>
    </View>
  );
}

export default function BatchListPage() {
  const { width } = useWindowDimensions();
  const asTable = width >= 1100; // sidebar 256px + 6 cột cần đủ rộng
  const { data: batches, loading, refetch } = useFetch(() => batchService.getMyBatches(), []);
  const empty = !loading && (!batches || batches.length === 0);

  const headCell = (w: number, label: string, right?: boolean) => (
    <View key={label} style={{ flex: w, padding: 12, alignItems: right ? "flex-end" : "flex-start" }}>
      <Txt size={12} lh={16} muted style={{ textTransform: "uppercase" }}>{label}</Txt>
    </View>
  );

  return (
    <PanelPage onRefresh={refetch}>
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
          <Txt size={14} lh={20} muted style={{ flex: 1 }}>
            Quản lý toàn bộ lô hàng của trang trại — từ nháp, chờ duyệt đến đang bán.
          </Txt>
          <Link href="/seller/batches/new" asChild>
            <Pressable
              style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.lg }}
            >
              <Icon name="plus" size={16} color={colors.primaryFg} />
              <Txt size={14} lh={20} weight="600" color={colors.primaryFg}>Tạo lô hàng mới</Txt>
            </Pressable>
          </Link>
        </View>

        {asTable ? (
          <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, overflow: "hidden" }}>
            <View style={{ flexDirection: "row", backgroundColor: "rgba(242,243,232,0.5)" }}>
              {headCell(COL.product, "Sản phẩm")}
              {headCell(COL.code, "Mã lô")}
              {headCell(COL.harvest, "Ngày thu hoạch")}
              {headCell(COL.qty, "Còn lại")}
              {headCell(COL.trust, "Cấp độ tin cậy")}
              {headCell(COL.status, "Trạng thái")}
              {headCell(COL.action, "", true)}
            </View>
            {batches?.map((b) => <TableRow key={b.id} b={b} />)}
            {empty ? (
              <Txt size={14} lh={20} muted center style={{ padding: 24 }}>Chưa có lô hàng nào — bấm "Tạo lô hàng mới" để bắt đầu.</Txt>
            ) : null}
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {batches?.map((b) => <BatchCard key={b.id} b={b} />)}
            {empty ? (
              <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl }}>
                <Txt size={14} lh={20} muted center style={{ padding: 24 }}>Chưa có lô hàng nào — bấm "Tạo lô hàng mới" để bắt đầu.</Txt>
              </View>
            ) : null}
          </View>
        )}
        {loading ? <Txt size={14} lh={20} muted style={{ marginTop: 12 }}>Đang tải...</Txt> : null}
      </View>
    </PanelPage>
  );
}
