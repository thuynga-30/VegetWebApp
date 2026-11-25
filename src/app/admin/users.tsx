import { useState } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { Link } from "expo-router";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Pill, StatusBadge } from "@/components/ui/Badges";
import { PanelPage } from "@/components/common/PanelPage";
import { useFetch } from "@/hooks/useFetch";
import { userService } from "@/services/userService";
import { farmService } from "@/services/farmService";
import { formatDate } from "@/lib/format";
import { USER_STATUS_LABEL, USER_STATUS_TONE } from "@/lib/constants";
import { confirmDialog, notify } from "@/lib/dialog";
import { errMessage } from "@/lib/errors";
import type { User, UserRole } from "@/types/user";

type RoleFilter = UserRole | "";
const ROLES: RoleFilter[] = ["", "admin", "seller", "buyer"];

// Độ rộng cột (flex) của bảng
const COL = { name: 1.7, email: 2.1, phone: 1.2, role: 0.8, farm: 1.2, status: 1.4, date: 1, action: 2.3 } as const;

const farmStatusLabel = (s?: "pending" | "approved" | "rejected"): "Pending" | "Approved" | "Rejected" =>
  s === "approved" ? "Approved" : s === "rejected" ? "Rejected" : "Pending";

function Cell({ w, children, right }: { w: number; children?: React.ReactNode; right?: boolean }) {
  return <View style={{ flex: w, padding: 12, justifyContent: "center", alignItems: right ? "flex-end" : "flex-start", minWidth: 0 }}>{children}</View>;
}

/** inline-flex gap-1 px-3 py-1.5 rounded-lg text-xs font-medium (nền nhạt, rê chuột đậm hơn) */
function SmallButton({ icon, label, tone, onPress, disabled }: {
  icon: IconName; label: string; tone: "primary" | "danger"; onPress: () => void; disabled?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const fg = tone === "primary" ? colors.primary : colors.destructive;
  const base = tone === "primary" ? "27,126,42" : "223,34,37";
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={{
        flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.lg,
        backgroundColor: `rgba(${base},${hover ? 0.2 : 0.1})`, opacity: disabled ? 0.5 : 1,
      }}
    >
      <Icon name={icon} size={14} color={fg} />
      <Txt size={12} lh={16} weight="500" color={fg}>{label}</Txt>
    </Pressable>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(27,126,42,0.1)", alignItems: "center", justifyContent: "center" }}>
      <Txt size={12} lh={16} weight="600" color={colors.primary}>{name?.[0]}</Txt>
    </View>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
      <Icon name="chevron-down" size={14} color={colors.mutedFg} />
    </View>
  );
}

/** Khung hồ sơ nông trại mở rộng dưới dòng người dùng */
function FarmDetails({ farm }: { farm: any }) {
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: "rgba(242,243,232,0.2)", padding: 16 }}>
      <View style={{ flexDirection: "row", gap: 16 }}>
        {farm.coverImage ? (
          <Img uri={farm.coverImage} style={{ width: 112, height: 80, borderRadius: radius.lg }} />
        ) : (
          <View style={{ width: 112, height: 80, borderRadius: radius.lg, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }}>
            <Txt size={12} lh={16} muted>Chưa có ảnh</Txt>
          </View>
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt size={16} lh={24} weight="600">{farm.farmName}</Txt>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
            <Icon name="map-pin" size={12} color={colors.mutedFg} />
            <Txt size={12} lh={16} muted style={{ flex: 1 }}>{farm.address}</Txt>
          </View>
          {farm.description ? <Txt size={14} lh={20} muted style={{ marginTop: 6 }}>{farm.description}</Txt> : null}
          {farm.areaHa ? <Txt size={12} lh={16} muted style={{ marginTop: 8 }}>Diện tích: {farm.areaHa}ha</Txt> : null}
          <Link href={`/admin/farms/${farm.id}`} asChild>
            <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 12, alignSelf: "flex-start" }}>
              <Txt size={12} lh={16} color={colors.primary}>Xem hồ sơ đầy đủ (giấy tờ, chứng nhận...)</Txt>
              <Icon name="arrow-right" size={12} color={colors.primary} />
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

interface RowProps {
  u: User;
  farm: any | undefined;
  open: boolean;
  toggleOpen: () => void;
  actingFarm: boolean;
  toggling: boolean;
  actFarm: (farmId: number, action: "approve" | "reject") => void;
  toggleStatus: (u: User) => void;
}

/** Cụm nút thao tác: duyệt/từ chối nông trại (nếu đang chờ) + khóa/mở tài khoản (trừ admin) */
function Actions({ u, farm, actingFarm, toggling, actFarm, toggleStatus }: RowProps) {
  const isDisabled = u.status === "Disabled";
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 8 }}>
      {farm && farm.status === "pending" ? (
        <>
          <SmallButton icon="check" label="Duyệt" tone="primary" disabled={actingFarm} onPress={() => actFarm(farm.id, "approve")} />
          <SmallButton icon="x" label="Từ chối" tone="danger" disabled={actingFarm} onPress={() => actFarm(farm.id, "reject")} />
        </>
      ) : null}
      {u.role !== "admin" ? (
        isDisabled ? (
          <SmallButton icon="rotate-ccw" label="Kích hoạt lại" tone="primary" disabled={toggling} onPress={() => toggleStatus(u)} />
        ) : (
          <SmallButton icon="ban" label="Vô hiệu hóa" tone="danger" disabled={toggling} onPress={() => toggleStatus(u)} />
        )
      ) : null}
    </View>
  );
}

function TableRow(p: RowProps) {
  const { u, farm, open, toggleOpen } = p;
  const [hover, setHover] = useState(false);
  const isDisabled = u.status === "Disabled";
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: colors.border, opacity: isDisabled ? 0.6 : 1 }}>
      <Pressable
        accessible={false}
        onPress={farm ? toggleOpen : undefined}
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        style={{ flexDirection: "row", backgroundColor: farm && hover ? "rgba(242,243,232,0.3)" : "transparent" }}
      >
        <Cell w={COL.name}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Avatar name={u.full_name} />
            <Txt size={14} lh={20} style={{ flexShrink: 1 }}>{u.full_name}</Txt>
          </View>
        </Cell>
        <Cell w={COL.email}><Txt size={14} lh={20}>{u.email}</Txt></Cell>
        <Cell w={COL.phone}><Txt size={14} lh={20}>{u.phone}</Txt></Cell>
        <Cell w={COL.role}>
          <View style={{ backgroundColor: colors.muted, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full }}>
            <Txt size={12} lh={16}>{u.role}</Txt>
          </View>
        </Cell>
        <Cell w={COL.farm}>
          {farm ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <StatusBadge status={farmStatusLabel(farm.status)} />
              <Chevron open={open} />
            </View>
          ) : (
            <Txt size={12} lh={16} muted>—</Txt>
          )}
        </Cell>
        <Cell w={COL.status}>
          <Pill label={USER_STATUS_LABEL[u.status ?? "Active"]} tone={USER_STATUS_TONE[u.status ?? "Active"]} />
        </Cell>
        <Cell w={COL.date}><Txt size={14} lh={20}>{formatDate(u.created_at)}</Txt></Cell>
        <Cell w={COL.action} right><Actions {...p} /></Cell>
      </Pressable>
      {farm && open ? <FarmDetails farm={farm} /> : null}
    </View>
  );
}

/** Điện thoại / màn hình hẹp: mỗi người dùng là một thẻ */
function UserCard(p: RowProps) {
  const { u, farm, open, toggleOpen } = p;
  const isDisabled = u.status === "Disabled";
  return (
    <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, overflow: "hidden", opacity: isDisabled ? 0.6 : 1 }}>
      <Pressable accessible={false} onPress={farm ? toggleOpen : undefined} style={{ padding: 16, gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Avatar name={u.full_name} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt size={16} lh={24} weight="600" numberOfLines={1}>{u.full_name}</Txt>
            <Txt size={12} lh={16} muted numberOfLines={1}>{u.email}</Txt>
          </View>
          <View style={{ backgroundColor: colors.muted, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full }}>
            <Txt size={12} lh={16}>{u.role}</Txt>
          </View>
        </View>
        {u.phone ? <Txt size={14} lh={20} muted>{u.phone}</Txt> : null}
        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <Pill label={USER_STATUS_LABEL[u.status ?? "Active"]} tone={USER_STATUS_TONE[u.status ?? "Active"]} />
          {farm ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <StatusBadge status={farmStatusLabel(farm.status)} />
              <Chevron open={open} />
            </View>
          ) : null}
        </View>
        <Txt size={12} lh={16} muted>Tạo ngày {formatDate(u.created_at)}</Txt>
        <View style={{ alignItems: "flex-start" }}>
          <Actions {...p} />
        </View>
      </Pressable>
      {farm && open ? <FarmDetails farm={farm} /> : null}
    </View>
  );
}

export default function UsersPage() {
  const { width } = useWindowDimensions();
  const asTable = width >= 1280; // sidebar 256px + 8 cột cần đủ rộng

  const [role, setRole] = useState<RoleFilter>("");
  const { data: users, loading, refetch: refetchUsers } = useFetch(() => userService.getAll(role || undefined), [role]);
  const { data: farms, refetch: refetchFarms } = useFetch(() => farmService.getAllAdmin(), []);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const actFarm = async (farmId: number, action: "approve" | "reject") => {
    setActingId(farmId);
    try {
      if (action === "approve") await farmService.approve(farmId);
      else await farmService.reject(farmId, "Hồ sơ nông trại chưa đủ minh chứng");
      refetchFarms();
    } catch (err) {
      notify("Không thể cập nhật nông trại", errMessage(err));
    } finally {
      setActingId(null);
    }
  };

  const toggleStatus = async (u: User) => {
    const isDisabled = u.status === "Disabled";
    const msg = isDisabled ? "Kích hoạt lại tài khoản này?" : "Vô hiệu hóa tài khoản này? Người dùng sẽ không thể đăng nhập.";
    if (!(await confirmDialog(msg, undefined, isDisabled ? "Kích hoạt" : "Vô hiệu hóa"))) return;
    setTogglingId(u.id);
    try {
      if (isDisabled) await userService.enable(u.id);
      else await userService.disable(u.id);
      refetchUsers();
    } catch (err) {
      notify("Không thể cập nhật tài khoản", errMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const rowProps = (u: User): RowProps => {
    const farm = u.role === "seller" ? farms?.find((f: any) => f.sellerId === u.id) : undefined;
    return {
      u,
      farm,
      open: expanded === u.id,
      toggleOpen: () => setExpanded(expanded === u.id ? null : u.id),
      actingFarm: !!farm && actingId === farm.id,
      toggling: togglingId === u.id,
      actFarm,
      toggleStatus,
    };
  };

  const head = (w: number, label: string, right?: boolean) => (
    <View key={label + w} style={{ flex: w, padding: 12, alignItems: right ? "flex-end" : "flex-start" }}>
      <Txt size={12} lh={16} muted style={{ textTransform: "uppercase" }}>{label}</Txt>
    </View>
  );

  const empty = !loading && (!users || users.length === 0);

  return (
    <PanelPage onRefresh={() => { refetchUsers(); refetchFarms(); }}>
      <View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 20 }}>
          {ROLES.map((r) => {
            const on = role === r;
            return (
              <Pressable
                key={r || "all"}
                onPress={() => setRole(r)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1,
                  borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primary : "transparent",
                }}
              >
                <Txt size={14} lh={20} color={on ? colors.primaryFg : colors.foreground}>{r === "" ? "Tất cả" : r}</Txt>
              </Pressable>
            );
          })}
        </View>

        {asTable ? (
          <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, overflow: "hidden" }}>
            <View style={{ flexDirection: "row", backgroundColor: "rgba(242,243,232,0.5)" }}>
              {head(COL.name, "Tên")}
              {head(COL.email, "Email")}
              {head(COL.phone, "SĐT")}
              {head(COL.role, "Vai trò")}
              {head(COL.farm, "Nông trại")}
              {head(COL.status, "Trạng thái TK")}
              {head(COL.date, "Ngày tạo")}
              {head(COL.action, "", true)}
            </View>
            {users?.map((u) => <TableRow key={u.id} {...rowProps(u)} />)}
            {empty ? <Txt size={14} lh={20} muted center style={{ padding: 24 }}>Không có người dùng nào.</Txt> : null}
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {users?.map((u) => <UserCard key={u.id} {...rowProps(u)} />)}
            {empty ? (
              <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl }}>
                <Txt size={14} lh={20} muted center style={{ padding: 24 }}>Không có người dùng nào.</Txt>
              </View>
            ) : null}
          </View>
        )}
        {loading ? <Txt size={14} lh={20} muted style={{ marginTop: 12 }}>Đang tải...</Txt> : null}
      </View>
    </PanelPage>
  );
}
