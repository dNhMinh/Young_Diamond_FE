import { useEffect, useMemo, useState } from "react";
import AdminModal from "./AdminModal";
import { uploadToCloudinary } from "../../../utils/cloudinary";
import type {
  ShippingCarrier,
  CreateShippingCarrierPayload,
  UpdateShippingCarrierPayload,
} from "../../../types/settings";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  initialValues?: ShippingCarrier; // edit
  onClose: () => void;
  onSubmit: (
    data:
      | { mode: "create"; payload: CreateShippingCarrierPayload }
      | { mode: "edit"; id: string; payload: UpdateShippingCarrierPayload },
  ) => Promise<void> | void;
  submitting?: boolean;
};

type Draft = {
  code: string; // create cần, edit cũng cho sửa
  name: string;
  description: string;
  isActive: boolean;
  logoUrl: string; // ✅ set sau khi upload
};

const emptyDraft: Draft = {
  code: "",
  name: "",
  description: "",
  isActive: true,
  logoUrl: "",
};

function buildDraft(mode: Mode, initial?: ShippingCarrier): Draft {
  if (mode === "edit" && initial) {
    return {
      code: initial.code ?? "",
      name: initial.name ?? "",
      description: initial.description ?? "",
      isActive: !!initial.isActive,
      logoUrl: initial.logoUrl ?? "",
    };
  }
  return { ...emptyDraft };
}

function toOptionalTrim(s: string): string | undefined {
  const v = s.trim();
  return v ? v : undefined;
}

export default function ShippingCarrierFormModal({
  open,
  mode,
  initialValues,
  onClose,
  onSubmit,
  submitting = false,
}: Props) {
  // init draft từ props (không effect)
  const [draft, setDraft] = useState<Draft>(() =>
    buildDraft(mode, initialValues),
  );

  // ✅ upload states
  const [uploading, setUploading] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  // cleanup local preview url
  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const title = useMemo(() => {
    return mode === "create"
      ? "Add Shipping Carrier"
      : `Update Shipping Carrier (${initialValues?.code ?? ""})`;
  }, [mode, initialValues?.code]);

  if (!open) return null;

  const disabled = submitting || uploading;

  const handlePickLogoFile = async (file: File) => {
    // preview local ngay lập tức
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    const tmp = URL.createObjectURL(file);
    setLocalPreviewUrl(tmp);

    setUploading(true);
    try {
      const uploaded = await uploadToCloudinary(file);
      setDraft((p) => ({ ...p, logoUrl: uploaded.secure_url }));
    } catch (e: unknown) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Upload logo thất bại.");
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl(null);
    setDraft((p) => ({ ...p, logoUrl: "" }));
  };

  const submit = async () => {
    if (uploading) return;

    const name = draft.name.trim();
    const code = draft.code.trim();

    // ✅ yêu cầu code + name cho cả create & edit (vì bạn muốn edit code)
    if (!code) return alert("Vui lòng nhập code (mã) đơn vị vận chuyển.");
    if (!name) return alert("Vui lòng nhập tên đơn vị vận chuyển.");

    if (mode === "create") {
      const payload: CreateShippingCarrierPayload = {
        code,
        name,
        description: toOptionalTrim(draft.description),
        isActive: !!draft.isActive,
        logoUrl: toOptionalTrim(draft.logoUrl),
      };

      await onSubmit({ mode: "create", payload });
      return;
    }

    // edit
    if (!initialValues?._id) return alert("Thiếu id đơn vị vận chuyển.");

    const payload: UpdateShippingCarrierPayload = {
      code, // ✅ gửi code khi update
      name,
      description: toOptionalTrim(draft.description),
      isActive: !!draft.isActive,
      logoUrl: toOptionalTrim(draft.logoUrl),
    };

    await onSubmit({ mode: "edit", id: initialValues._id, payload });
  };

  return (
    <AdminModal
      open={open}
      title={title}
      onClose={onClose}
      widthClassName="max-w-2xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/10"
            disabled={disabled}
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-60"
            disabled={disabled}
          >
            {uploading
              ? "Uploading..."
              : submitting
                ? "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Update"}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Code */}
        <div>
          <div className="mb-1 text-xs text-white/60">Code (unique)</div>
          <input
            value={draft.code}
            onChange={(e) => setDraft((p) => ({ ...p, code: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            placeholder="VD: JNT"
            autoComplete="off"
            disabled={disabled}
          />
        </div>

        {/* Name */}
        <div>
          <div className="mb-1 text-xs text-white/60">Name</div>
          <input
            value={draft.name}
            onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            placeholder="VD: J&T Express"
            disabled={disabled}
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <div className="mb-1 text-xs text-white/60">Description</div>
          <input
            value={draft.description}
            onChange={(e) =>
              setDraft((p) => ({ ...p, description: e.target.value }))
            }
            className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            placeholder="Mô tả ngắn..."
            disabled={disabled}
          />
        </div>

        {/* ✅ Upload Logo (replace input URL) */}
        <div className="md:col-span-2">
          <div className="mb-1 text-xs text-white/60">Logo</div>

          <div className="flex flex-wrap items-center gap-2">
            <label
              className={[
                "inline-flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm",
                "border-white/15 text-white hover:bg-white/10",
                disabled ? "opacity-60 pointer-events-none" : "",
              ].join(" ")}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handlePickLogoFile(f);
                  e.currentTarget.value = "";
                }}
              />
              {uploading ? "Uploading..." : "Upload Logo"}
            </label>

            <button
              type="button"
              onClick={removeLogo}
              disabled={disabled || (!draft.logoUrl && !localPreviewUrl)}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-60"
            >
              Remove
            </button>

            <div className="min-w-[240px] flex-1 text-xs text-white/60">
              {draft.logoUrl ? (
                <span className="break-all">URL: {draft.logoUrl}</span>
              ) : (
                <span>No uploaded URL</span>
              )}
            </div>
          </div>
        </div>

        {/* Active */}
        <div className="md:col-span-2 flex items-center gap-2">
          <input
            id="carrierActive"
            type="checkbox"
            checked={!!draft.isActive}
            onChange={(e) =>
              setDraft((p) => ({ ...p, isActive: e.target.checked }))
            }
            className="h-4 w-4"
            disabled={disabled}
          />
          <label htmlFor="carrierActive" className="text-sm text-white/80">
            Active
          </label>
        </div>

        {/* Preview */}
        <div className="md:col-span-2 rounded-lg border border-white/10 bg-[#0f0f0f] p-3">
          <div className="mb-2 text-xs text-white/60">Logo preview</div>

          {localPreviewUrl || draft.logoUrl.trim() ? (
            <img
              src={localPreviewUrl ?? draft.logoUrl}
              alt="Logo"
              className="max-h-40 w-full rounded-md object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="text-sm text-white/40">No image</div>
          )}
        </div>
      </div>
    </AdminModal>
  );
}
