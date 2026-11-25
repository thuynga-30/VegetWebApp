import { useState } from "react";
import { Pressable, View } from "react-native";
import { colors, radius } from "@/theme";
import { Txt } from "@/components/ui/Txt";
import { Img, Lightbox } from "@/components/ui/Img";
import { formatDate } from "@/lib/format";

/** Chấp nhận nhiều dạng tên trường mà backend có thể trả về */
export interface CultivationLog {
  id?: number | string;
  activity?: string;
  title?: string;
  description?: string;
  activity_date?: string;
  activityDate?: string;
  log_date?: string;
  logDate?: string;
  date?: string;
  image?: string;
  image_url?: string;
  imageUrl?: string;
  created_by?: string;
  createdBy?: string;
}

const dateOf = (l: CultivationLog) => l.activity_date ?? l.activityDate ?? l.log_date ?? l.logDate ?? l.date;

/**
 * Thẻ "Nhật ký canh tác" của khu vực kiểm duyệt:
 * viền trái green-200, chấm green-700 có vòng green-100, ảnh minh chứng 128px (bấm để phóng to).
 */
export default function CultivationLogTimeline({ logs }: { logs: CultivationLog[] }) {
  const [preview, setPreview] = useState<string | null>(null);

  const sorted = [...logs].sort((a, b) => new Date(dateOf(a) ?? 0).getTime() - new Date(dateOf(b) ?? 0).getTime());

  return (
    <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <Txt size={16} lh={24} weight="600">Nhật ký canh tác</Txt>
        <Txt size={14} lh={20} muted>{logs.length} hoạt động</Txt>
      </View>

      {sorted.length === 0 ? (
        <Txt size={14} lh={20} muted>Chưa có nhật ký canh tác được ghi nhận.</Txt>
      ) : (
        <View style={{ marginLeft: 8, borderLeftWidth: 2, borderLeftColor: "#bbf7d0", gap: 24 }}>
          {sorted.map((log, index) => {
            const title = log.activity ?? log.title ?? "Hoạt động canh tác";
            const date = dateOf(log);
            const image = log.image_url ?? log.imageUrl ?? log.image;
            const by = log.created_by ?? log.createdBy;
            return (
              <View key={log.id ?? index} style={{ paddingLeft: 24 }}>
                {/* chấm 16px + ring 4px, tâm nằm trên đường viền trái */}
                <View
                  style={{
                    position: "absolute", left: -13, top: 0, width: 24, height: 24, borderRadius: 12,
                    backgroundColor: colors.green100, alignItems: "center", justifyContent: "center",
                  }}
                >
                  <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.green700 }} />
                </View>

                {date ? <Txt size={14} lh={20} muted>{formatDate(date)}</Txt> : null}
                <Txt size={16} lh={24} weight="600" style={{ marginTop: 4 }}>{title}</Txt>
                {log.description ? <Txt size={14} lh={20} muted style={{ marginTop: 4 }}>{log.description}</Txt> : null}
                {by ? <Txt size={12} lh={16} muted style={{ marginTop: 8 }}>Người ghi nhận: {by}</Txt> : null}
                {image ? (
                  <Pressable onPress={() => setPreview(image)} style={{ marginTop: 12, alignSelf: "flex-start" }} accessibilityLabel={`Minh chứng ${title}`}>
                    <Img uri={image} style={{ width: 128, height: 128, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border }} />
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>
      )}

      <Lightbox uri={preview} onClose={() => setPreview(null)} />
    </View>
  );
}
