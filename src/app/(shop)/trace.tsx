import { useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { colors, radius } from "@/theme";
import { Screen } from "@/components/ui/Screen";
import { Txt } from "@/components/ui/Txt";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Grid, Timeline } from "@/components/ui/Misc";
import { HeroGradient } from "@/components/ui/Gradient";
import { TrustBadge } from "@/components/ui/Badges";
import { QRCode } from "@/components/common/QRCode";
import { QRScannerModal } from "@/components/common/QRScannerModal";
import { useLayout } from "@/hooks/useLayout";
import { batchService } from "@/services/batchService";
import { formatDate } from "@/lib/format";
import { extractBatchCode } from "@/lib/trace";
import { errMessage } from "@/lib/errors";
import type { BatchTraceData } from "@/types/batch";

/** bg-card border rounded-2xl p-6 */
function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <View style={[{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 24 }, style]}>
      {children}
    </View>
  );
}

export default function TraceabilityPage() {
  const params = useLocalSearchParams<{ code?: string }>();
  const initialCode = typeof params.code === "string" ? params.code : "";
  const { isMd } = useLayout();

  const [code, setCode] = useState(initialCode);
  const [searched, setSearched] = useState(initialCode);
  const [data, setData] = useState<BatchTraceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);

  const search = async (value: string) => {
    const batchCode = value.trim();
    if (!batchCode) {
      setError("Vui lòng nhập mã lô hàng.");
      return;
    }
    setLoading(true);
    setError("");
    setData(null);
    try {
      const response = await batchService.getTraceByCode(batchCode);
      setData(response);
      setSearched(batchCode);
    } catch (err: any) {
      console.warn("Traceability error:", err);
      setData(null);
      setError(errMessage(err, "Không tìm thấy lô hàng với mã này."));
    } finally {
      setLoading(false);
    }
  };

  // Mở bằng link có ?code=... (vd quét QR bằng camera điện thoại, hoặc từ trang chi tiết sản phẩm) thì tra cứu luôn
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      search(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  // Quét QR xong: đóng camera, điền mã vào ô nhập và tra cứu
  const handleScan = (text: string) => {
    setScanning(false);
    const value = extractBatchCode(text);
    setCode(value);
    search(value);
  };

  const dateTile = (label: string, date: string) => (
    <View style={{ padding: 12, borderRadius: radius.lg, backgroundColor: "rgba(242,243,232,0.5)" }}>
      <Txt size={14} lh={20} muted>{label}</Txt>
      <Txt size={14} lh={20} weight="700">{formatDate(date)}</Txt>
    </View>
  );

  return (
    <Screen padded={false} footer>
      <View style={{ width: "100%", maxWidth: 768, alignSelf: "center", paddingHorizontal: 16, paddingVertical: 56 }}>
        {/* HEADER */}
        <View style={{ alignItems: "center" }}>
          <Pressable
            onPress={() => setScanning(true)}
            accessibilityLabel="Quét mã QR"
            accessibilityRole="button"
            style={{ borderRadius: radius.xxl, outlineStyle: "none" } as any}
          >
            <HeroGradient style={{ width: 56, height: 56, borderRadius: radius.xxl }}>
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Icon name="scan-line" size={28} color={colors.white} />
              </View>
            </HeroGradient>
          </Pressable>
          <Txt size={30} lh={36} weight="700" center style={{ marginTop: 16 }}>Truy xuất nguồn gốc</Txt>
          <Txt size={16} lh={24} muted center style={{ marginTop: 4 }}>
            Nhập mã lô hàng in trên bao bì (VD: GF-XLR-2026-001) hoặc quét mã QR.
          </Txt>
        </View>

        {/* SEARCH */}
        <View style={{ marginTop: 24, flexDirection: "row", gap: 8 }}>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Nhập mã lô hàng..."
            placeholderTextColor={colors.mutedFg + "99"}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => search(code)}
            style={{
              flex: 1, minWidth: 0, paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.xl,
              borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background,
              fontSize: 16, fontFamily: "BeVietnamPro_400Regular", color: colors.foreground,
            }}
          />
          <Pressable
            onPress={loading ? undefined : () => search(code)}
            style={{
              paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.xl, backgroundColor: colors.primary,
              justifyContent: "center", opacity: loading ? 0.6 : 1,
            }}
          >
            <Txt size={16} lh={24} weight="600" color={colors.primaryFg}>{loading ? "Đang tìm..." : "Tra cứu"}</Txt>
          </Pressable>
        </View>

        {/* ERROR */}
        {error ? (
          <Txt size={14} lh={20} color={colors.destructive} center style={{ marginTop: 12 }}>{error}</Txt>
        ) : null}

        {/* RESULT */}
        {data ? (
          <View style={{ marginTop: 40, gap: 24 }}>
            {/* THÔNG TIN LÔ HÀNG */}
            <Card style={{ flexDirection: isMd ? "row" : "column", gap: 24, alignItems: isMd ? "flex-start" : "stretch" }}>
              <View style={{ alignSelf: isMd ? "flex-start" : "center" }}>
                <QRCode value={searched} />
              </View>

              <View style={{ flex: isMd ? 1 : undefined, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <TrustBadge level={data.trustLevel} />
                  {data.isFullyVerified ? <Icon name="check-circle-2" size={20} color={colors.primary} /> : null}
                </View>

                <Txt size={14} lh={20} mono muted style={{ marginTop: 8 }}>{data.batchCode}</Txt>
                <Txt size={20} lh={28} weight="600" style={{ marginTop: 8 }}>{data.productName}</Txt>
                <Txt size={16} lh={24} weight="500" style={{ marginTop: 8 }}>
                  {data.farm?.farmName ?? "Chưa có thông tin nông trại"}
                </Txt>

                {data.farm?.address ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                    <Icon name="map-pin" size={16} color={colors.mutedFg} />
                    <Txt size={14} lh={20} muted style={{ flex: 1 }}>{data.farm.address}</Txt>
                  </View>
                ) : null}

                <View style={{ marginTop: 16 }}>
                  <Grid cols={2} gap={12}>
                    {dateTile("Gieo trồng", data.plantingDate)}
                    {dateTile("Thu hoạch", data.harvestDate)}
                  </Grid>
                </View>
              </View>
            </Card>

            {/* NHẬT KÝ CANH TÁC */}
            <Card>
              <Txt size={16} lh={24} weight="600" style={{ marginBottom: 16 }}>Nhật ký canh tác</Txt>
              {data.cultivationLogs.length === 0 ? (
                <Txt size={14} lh={20} muted>Chưa có nhật ký canh tác.</Txt>
              ) : (
                <Timeline
                  items={data.cultivationLogs.map((log) => ({
                    id: log.id,
                    date: formatDate(log.log_date),
                    title: log.activity,
                    description: log.description,
                    image: log.image ?? null,
                  }))}
                  renderImage={(uri) => <Img uri={uri} style={{ width: 160, height: 96, borderRadius: radius.lg }} />}
                />
              )}
            </Card>

            {/* HÌNH ẢNH */}
            {data.images.length > 0 ? (
              <Card>
                <Txt size={16} lh={24} weight="600" style={{ marginBottom: 12 }}>Hình ảnh thực tế</Txt>
                <Grid cols={isMd ? 4 : 3} gap={8}>
                  {data.images.map((image, index) => (
                    <Img key={`${image}-${index}`} uri={image} style={{ width: "100%", aspectRatio: 1, borderRadius: radius.lg }} />
                  ))}
                </Grid>
              </Card>
            ) : null}
          </View>
        ) : null}

        {/* CAMERA QUÉT QR */}
        {scanning ? <QRScannerModal onScan={handleScan} onClose={() => setScanning(false)} /> : null}
      </View>
    </Screen>
  );
}
