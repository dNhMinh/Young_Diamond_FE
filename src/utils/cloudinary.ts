//src/utils/cloudinary.ts
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

export function assertCloudinaryConfig() {
  if (!cloud || !preset) {
    throw new Error(
      "Missing Cloudinary config. Please set VITE_CLOUDINARY_CLOUD and VITE_CLOUDINARY_UPLOAD_PRESET in .env",
    );
  }
}

export async function uploadToCloudinary(
  file: File,
): Promise<CloudinaryUploadResult> {
  assertCloudinaryConfig();

  const url = `https://api.cloudinary.com/v1_1/dzdxqw0i7/image/upload`;

  const form = new FormData();
  form.append("file", file);
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
