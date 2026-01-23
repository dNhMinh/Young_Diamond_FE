import { useEffect, useMemo, useState } from "react";
import {
  getAdminSettingsApi,
  updateAdminSettingsApi,
} from "../../../api/admin/settings.api";
import type { SystemSettings } from "../../../types/settings";
import { getErrorMessage } from "./httpHelpers";
import { uploadToCloudinary } from "../../../utils/cloudinary";

type Props = { active: boolean };

const emptyForm: Required<
  Pick<
    SystemSettings,
    | "siteTitle"
    | "siteDescription"
    | "siteLogoUrl"
    | "contactEmail"
    | "contactPhoneNumber"
    | "address"
    | "urlFacebook"
    | "urlInstagram"
    | "paymentQRImageUrl"
  >
> = {
  siteTitle: "",
  siteDescription: "",
  siteLogoUrl: "",
  contactEmail: "",
  contactPhoneNumber: "",
  address: "",
  urlFacebook: "",
  urlInstagram: "",
  paymentQRImageUrl: "",
};

export default function SystemSettingsSection({ active }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [serverId, setServerId] = useState<string | undefined>(undefined);

  // upload state riêng cho từng ảnh
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingQR, setUploadingQR] = useState(false);

  const canSave = useMemo(() => true, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await getAdminSettingsApi();
      const s = res.data.data;

      setServerId(s?._id);

      setForm({
        siteTitle: s?.siteTitle ?? "",
        siteDescription: s?.siteDescription ?? "",
        siteLogoUrl: s?.siteLogoUrl ?? "",
        contactEmail: s?.contactEmail ?? "",
        contactPhoneNumber: s?.contactPhoneNumber ?? "",
        address: s?.address ?? "",
        urlFacebook: s?.urlFacebook ?? "",
        urlInstagram: s?.urlInstagram ?? "",
        paymentQRImageUrl: s?.paymentQRImageUrl ?? "",
      });
    } catch (e: unknown) {
      console.error(e);
      alert(getErrorMessage(e, "Không lấy được cấu hình hệ thống."));
      setForm(emptyForm);
      setServerId(undefined);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUploadImage = async (
    file: File,
    target: "logo" | "paymentQR",
  ) => {
    const setUploading = target === "logo" ? setUploadingLogo : setUploadingQR;

    // validate nhanh
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh.");
      return;
    }
    const maxMb = 5;
    if (file.size > maxMb * 1024 * 1024) {
      alert(`File quá lớn. Vui lòng chọn ảnh <= ${maxMb}MB.`);
      return;
    }

    setUploading(true);
    try {
      const res = await uploadToCloudinary(file);
      if (target === "logo") onChange("siteLogoUrl", res.secure_url);
      else onChange("paymentQRImageUrl", res.secure_url);
    } catch (e: unknown) {
      console.error(e);
      alert(getErrorMessage(e, "Upload ảnh thất bại."));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!canSave) return;

    if (uploadingLogo || uploadingQR) {
      alert("Đang upload ảnh, vui lòng chờ xong rồi lưu.");
      return;
    }

    const ok = confirm("Lưu cấu hình hệ thống?");
    if (!ok) return;

    setSaving(true);
    try {
      const res = await updateAdminSettingsApi({ ...form });
      alert(res.data.message || "Saved");
      await fetchSettings();
    } catch (e: unknown) {
      console.error(e);
      alert(getErrorMessage(e, "Lưu cấu hình thất bại."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={active ? "block" : "hidden"}>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-white/70">
          ID: <span className="text-white">{serverId ?? "(auto-create)"}</span>
        </div>

        <button
          onClick={handleSave}
          disabled={
            saving || loading || !canSave || uploadingLogo || uploadingQR
          }
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-white/60">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Site title"
            value={form.siteTitle}
            onChange={(v) => onChange("siteTitle", v)}
          />
          <Field
            label="Site description"
            value={form.siteDescription}
            onChange={(v) => onChange("siteDescription", v)}
          />
          <Field
            label="Contact email"
            value={form.contactEmail}
            onChange={(v) => onChange("contactEmail", v)}
          />
          <Field
            label="Contact phone"
            value={form.contactPhoneNumber}
            onChange={(v) => onChange("contactPhoneNumber", v)}
          />
          <Field
            label="Address"
            value={form.address}
            onChange={(v) => onChange("address", v)}
          />
          <Field
            label="Facebook URL"
            value={form.urlFacebook}
            onChange={(v) => onChange("urlFacebook", v)}
          />
          <Field
            label="Instagram URL"
            value={form.urlInstagram}
            onChange={(v) => onChange("urlInstagram", v)}
          />

          {/* Upload ảnh + URL (readonly) */}
          <div className="md:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ImageUploader
              title="Site Logo"
              url={form.siteLogoUrl}
              uploading={uploadingLogo}
              onFile={(file) => handleUploadImage(file, "logo")}
              onClear={() => onChange("siteLogoUrl", "")}
            />

            <ImageUploader
              title="Payment QR"
              url={form.paymentQRImageUrl}
              uploading={uploadingQR}
              onFile={(file) => handleUploadImage(file, "paymentQR")}
              onClear={() => onChange("paymentQRImageUrl", "")}
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ImagePreview title="Logo preview" url={form.siteLogoUrl} />
            <ImagePreview
              title="Payment QR preview"
              url={form.paymentQRImageUrl}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-xs text-white/60">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
        placeholder={label}
      />
    </div>
  );
}

function ImageUploader({
  title,
  url,
  uploading,
  onFile,
  onClear,
}: {
  title: string;
  url: string;
  uploading: boolean;
  onFile: (file: File) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#0f0f0f] p-3">
      <div className="mb-2 text-xs text-white/60">{title}</div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-white/15 px-3 py-2 text-xs text-white hover:bg-white/10">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              // reset để chọn lại cùng 1 file vẫn trigger onChange
              e.currentTarget.value = "";
            }}
          />
          {uploading ? "Uploading..." : "Upload image"}
        </label>

        <button
          type="button"
          onClick={onClear}
          disabled={!url || uploading}
          className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white hover:bg-white/10 disabled:opacity-60"
        >
          Clear
        </button>
      </div>

      <div className="mt-3">
        <div className="mb-1 text-xs text-white/60">URL (auto)</div>
        <input
          value={url}
          readOnly
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 outline-none"
          placeholder="(uploaded URL will appear here)"
        />
      </div>
    </div>
  );
}

function ImagePreview({ title, url }: { title: string; url: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#0f0f0f] p-3">
      <div className="mb-2 text-xs text-white/60">{title}</div>
      {url ? (
        <img
          src={url}
          alt={title}
          className="max-h-40 w-full rounded-md object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="text-sm text-white/40">No image</div>
      )}
    </div>
  );
}
