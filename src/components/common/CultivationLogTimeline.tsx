import { useState } from "react";
import { Pressable } from "react-native";
import { Card } from "@/components/ui/Card";
import { Txt } from "@/components/ui/Txt";
import { View } from "react-native";
import { Img, Lightbox } from "@/components/ui/Img";
import { Timeline, type TimelineItem } from "@/components/ui/Misc";
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

export function normalizeLogs(logs: CultivationLog[]): TimelineItem[] {
  const dateOf = (l: CultivationLog) => l.activity_date ?? l.activityDate ?? l.log_date ?? l.logDate ?? l.date;
  return [...logs]
    .sort((a, b) => new Date(dateOf(a) ?? 0).getTime() - new Date(dateOf(b) ?? 0).getTime())
    .map((l, i) => ({
      id: l.id ?? i,
      date: dateOf(l) ? formatDate(dateOf(l)) : undefined,
      title: l.activity ?? l.title ?? "Hoạt động canh tác",
      description: l.description,
      image: l.image_url ?? l.imageUrl ?? l.image ?? null,
      by: l.created_by ?? l.createdBy,
    }));
}

export function LogsTimeline({ logs, emptyText = "Chưa có nhật ký canh tác được ghi nhận." }: { logs: CultivationLog[]; emptyText?: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const items = normalizeLogs(logs);
  if (items.length === 0) return <Txt variant="small" muted>{emptyText}</Txt>;
  return (
    <View>
      <Timeline
        items={items}
        renderImage={(uri) => (
          <Pressable onPress={() => setPreview(uri)}>
            <Img uri={uri} style={{ width: 112, height: 112, borderRadius: 10 }} />
          </Pressable>
        )}
      />
      <Lightbox uri={preview} onClose={() => setPreview(null)} />
    </View>
  );
}

export default function CultivationLogTimeline({ logs }: { logs: CultivationLog[] }) {
  return (
    <Card>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Txt variant="h3">Nhật ký canh tác</Txt>
        <Txt variant="small" muted>{logs.length} hoạt động</Txt>
      </View>
      <LogsTimeline logs={logs} />
    </Card>
  );
}
