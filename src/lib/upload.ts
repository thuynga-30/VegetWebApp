import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

export interface PickedImage {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB, khớp backend

function toPicked(a: ImagePicker.ImagePickerAsset, i: number): PickedImage {
  const ext = (a.mimeType?.split("/")[1] || a.uri.split(".").pop() || "jpg").split("?")[0];
  return {
    uri: a.uri,
    name: a.fileName || `image-${Date.now()}-${i}.${ext}`,
    type: a.mimeType || `image/${ext === "jpg" ? "jpeg" : ext}`,
    size: a.fileSize,
  };
}

/** Mở thư viện ảnh (web: hộp chọn file). Trả [] nếu huỷ. Ném lỗi nếu không được cấp quyền. */
export async function pickImages(opts: { multiple?: boolean; limit?: number } = {}): Promise<PickedImage[]> {
  if (Platform.OS !== "web") {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) throw new Error("Bạn chưa cấp quyền truy cập thư viện ảnh.");
  }
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: !!opts.multiple,
    selectionLimit: opts.limit ?? (opts.multiple ? 10 : 1),
    quality: 0.85,
  });
  if (res.canceled) return [];
  return res.assets.map(toPicked);
}

/** Thêm file vào FormData theo đúng cách của từng nền tảng */
export async function appendFile(form: FormData, field: string, img: PickedImage) {
  if (Platform.OS === "web") {
    const blob = await (await fetch(img.uri)).blob();
    form.append(field, blob, img.name);
  } else {
    form.append(field, { uri: img.uri, name: img.name, type: img.type } as any);
  }
}
