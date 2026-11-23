import { useState } from "react";
import { Image, Modal, Pressable, View, type ImageStyle, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "@/theme";
import { Txt } from "./Txt";
import { Icon } from "./Icon";

interface Props {
  uri?: string | null;
  style?: StyleProp<ImageStyle & ViewStyle>;
  fallback?: string;
  contain?: boolean;
}

export function Img({ uri, style, fallback = "Không có ảnh", contain }: Props) {
  const [failed, setFailed] = useState(false);
  if (!uri || failed) {
    return (
      <View style={[{ backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }, style as StyleProp<ViewStyle>]}>
        <Txt variant="tiny" muted center>{fallback}</Txt>
      </View>
    );
  }
  return <Image source={{ uri }} style={style as StyleProp<ImageStyle>} resizeMode={contain ? "contain" : "cover"} onError={() => setFailed(true)} />;
}

/** Xem ảnh toàn màn hình */
export function Lightbox({ uri, onClose }: { uri: string | null; onClose: () => void }) {
  return (
    <Modal visible={!!uri} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: 16 }}>
        {uri ? <Image source={{ uri }} style={{ width: "100%", height: "85%" }} resizeMode="contain" /> : null}
        <View style={{ position: "absolute", top: 40, right: 20 }}>
          <Icon name="x" size={26} color={colors.white} />
        </View>
      </Pressable>
    </Modal>
  );
}
