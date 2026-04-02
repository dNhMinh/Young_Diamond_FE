// src/utils/cloudinary.ts
export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
};

const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD as string | undefined;
const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as
  | string
  | undefined;
const folder = import.meta.env.VITE_CLOUDINARY_FOLDER as string | undefined;

const MAX_CLOUDINARY_IMAGE_BYTES = 10 * 1024 * 1024;
const TARGET_MAX_BYTES = 9.5 * 1024 * 1024;
const MAX_DIMENSION = 2200;

export function assertCloudinaryConfig() {
  if (!cloud || !preset) {
    throw new Error(
      "Missing Cloudinary config. Please set VITE_CLOUDINARY_CLOUD and VITE_CLOUDINARY_UPLOAD_PRESET in .env",
    );
  }
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Không đọc được ảnh để nén."));
    };

    img.src = objectUrl;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Không tạo được blob sau khi nén ảnh."));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

async function compressImageIfNeeded(file: File): Promise<File> {
  // Không phải ảnh thì giữ nguyên
  if (!file.type.startsWith("image/")) return file;

  // File đã nhỏ hơn ngưỡng thì giữ nguyên
  if (file.size <= TARGET_MAX_BYTES) return file;

  const img = await loadImageFromFile(file);

  let width = img.naturalWidth;
  let height = img.naturalHeight;

  // resize nếu quá lớn
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Không khởi tạo được canvas để nén ảnh.");
  }

  ctx.drawImage(img, 0, 0, width, height);

  // Ưu tiên jpeg/webp để nén tốt
  const outputType =
    file.type === "image/png" ? "image/jpeg" : file.type || "image/jpeg";

  const qualitySteps = [0.88, 0.82, 0.76, 0.7, 0.62, 0.55];

  for (const quality of qualitySteps) {
    const blob = await canvasToBlob(canvas, outputType, quality);

    if (blob.size <= TARGET_MAX_BYTES) {
      const extension = outputType.includes("png")
        ? "png"
        : outputType.includes("webp")
          ? "webp"
          : "jpg";

      return new File(
        [blob],
        file.name.replace(/\.[^.]+$/, "") + `-compressed.${extension}`,
        {
          type: outputType,
          lastModified: Date.now(),
        },
      );
    }
  }

  // fallback: thử ép nhỏ kích thước hơn nữa
  const smallerCanvas = document.createElement("canvas");
  smallerCanvas.width = Math.max(1, Math.round(width * 0.8));
  smallerCanvas.height = Math.max(1, Math.round(height * 0.8));

  const smallerCtx = smallerCanvas.getContext("2d");
  if (!smallerCtx) {
    throw new Error("Không khởi tạo được canvas resize bổ sung.");
  }

  smallerCtx.drawImage(img, 0, 0, smallerCanvas.width, smallerCanvas.height);

  const fallbackBlob = await canvasToBlob(smallerCanvas, "image/jpeg", 0.72);

  if (fallbackBlob.size > MAX_CLOUDINARY_IMAGE_BYTES) {
    throw new Error(
      "Ảnh quá lớn. Đã thử nén tự động nhưng vẫn vượt giới hạn 10MB của Cloudinary. Vui lòng giảm dung lượng ảnh trước khi upload.",
    );
  }

  return new File(
    [fallbackBlob],
    file.name.replace(/\.[^.]+$/, "") + "-compressed.jpg",
    {
      type: "image/jpeg",
      lastModified: Date.now(),
    },
  );
}

export async function uploadToCloudinary(
  file: File,
): Promise<CloudinaryUploadResult> {
  assertCloudinaryConfig();

  const preparedFile = await compressImageIfNeeded(file);

  const url = `https://api.cloudinary.com/v1_1/${cloud}/image/upload`;

  const form = new FormData();
  form.append("file", preparedFile);
  form.append("upload_preset", preset!);
  if (folder) form.append("folder", folder);

  const res = await fetch(url, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${text}`);
  }

  const data = (await res.json()) as CloudinaryUploadResult;
  return data;
}

export type CloudinaryUploadAnyResult = {
  secure_url: string;
  public_id: string;
  resource_type?: "image" | "video" | "raw" | string;
  format?: string;
  width?: number;
  height?: number;
  duration?: number;
};

export async function uploadBannerMediaToCloudinary(
  file: File,
): Promise<CloudinaryUploadAnyResult> {
  assertCloudinaryConfig();

  // Nếu là ảnh thì cũng nén trước
  const preparedFile = file.type.startsWith("image/")
    ? await compressImageIfNeeded(file)
    : file;

  const url = `https://api.cloudinary.com/v1_1/${cloud}/auto/upload`;

  const form = new FormData();
  form.append("file", preparedFile);
  form.append("upload_preset", preset!);
  if (folder) form.append("folder", folder);

  const res = await fetch(url, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${text}`);
  }

  const data = (await res.json()) as CloudinaryUploadAnyResult;
  return data;
}
