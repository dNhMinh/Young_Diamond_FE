// src/components/admin/modals/BannerFormModal.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import AdminModal from "./AdminModal";
import type {
  Banner,
  BannerType,
  CreateBannerPayload,
} from "../../../api/admin/banners.api";
import { uploadToCloudinary } from "../../../utils/cloudinary";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  initialValues?: Banner;
  onClose: () => void;
  onSubmit: (payload: CreateBannerPayload) => Promise<void> | void;
  submitting?: boolean;
};

type Draft = {
  imageUrl: string;
  linkUrl: string;
  altText: string;
  position: number;
  type: BannerType;
  isActive: boolean;
  startDate: string; // datetime-local
  endDate: string; // datetime-local
};

const emptyDraft: Draft = {
  imageUrl: "",
  linkUrl: "",
  altText: "",
  position: 1,
  type: "homepage",
  isActive: true,
  startDate: "",
  endDate: "",
};

const pad2 = (n: number) => String(n).padStart(2, "0");

function isoToDatetimeLocal(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function datetimeLocalToIso(v: string) {
  const s = v?.trim();
  if (!s) return undefined;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function buildDraft(mode: Mode, initial?: Banner): Draft {
  if (mode === "edit" && initial) {
    return {
      imageUrl: initial.imageUrl ?? "",
      linkUrl: initial.linkUrl ?? "",
      altText: initial.altText ?? "",
      position: Number(initial.position ?? 1),
      type: (initial.type ?? "homepage") as BannerType,
      isActive: !!initial.isActive,
      startDate: isoToDatetimeLocal(initial.startDate),
      endDate: isoToDatetimeLocal(initial.endDate),
    };
  }
  return { ...emptyDraft };
}

function optTrim(s: string) {
  const v = s.trim();
  return v ? v : undefined;
}

export default function BannerFormModal({
  open,
  mode,
  initialValues,
  onClose,
  onSubmit,
  submitting = false,
}: Props) {
  const init = useMemo(
    () => buildDraft(mode, initialValues),
    [mode, initialValues],
  );

  const [draft, setDraft] = useState<Draft>(() => init);

  // ✅ reset đúng dữ liệu khi mở modal / đổi initial
  useEffect(() => {
    if (!open) return;
    setDraft(init);
  }, [open, init]);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!open) return null;

  const pickFile = () => fileRef.current?.click();

  const handleUpload = async (file?: File | null) => {
    if (!file) return;

    // Optional: chặn file quá to (tùy bạn muốn)
    // if (file.size > 8 * 1024 * 1024) return alert("File quá lớn (tối đa 8MB).");

    setUploading(true);
    try {
      const result = await uploadToCloudinary(file);
      const url = result.secure_url;
      if (!url) throw new Error("Missing secure_url from Cloudinary");
      setDraft((p) => ({ ...p, imageUrl: url }));
    } catch (e) {
      console.error(e);
      alert(
        "Upload Cloudinary thất bại. Kiểm tra preset/cloud/folder trong .env",
      );
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    const imageUrl = draft.imageUrl.trim();
    if (!imageUrl) return alert("Vui lòng upload ảnh banner (imageUrl).");

    const payload: CreateBannerPayload = {
      imageUrl,
      linkUrl: optTrim(draft.linkUrl),
      altText: optTrim(draft.altText),
      position: Number(draft.position || 1),
      type: draft.type,
      isActive: !!draft.isActive,
      startDate: datetimeLocalToIso(draft.startDate),
      endDate: datetimeLocalToIso(draft.endDate),
    };

    // Optional: validate date range
    const s = payload.startDate ? new Date(payload.startDate).getTime() : null;
    const e = payload.endDate ? new Date(payload.endDate).getTime() : null;
    if (s && e && e < s) return alert("endDate phải lớn hơn startDate");

    await onSubmit(payload);
  };

  const disabled = submitting || uploading;

  return (
    <AdminModal
      open={open}
      title={mode === "create" ? "Add Banner" : "Update Banner"}
      onClose={onClose}
      widthClassName="max-w-3xl"
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
            {submitting ? "Saving..." : mode === "create" ? "Create" : "Update"}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Image */}
        <div className="md:col-span-2 rounded-lg border border-white/10 bg-[#0f0f0f] p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-xs text-white/60">Banner image</div>

            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void handleUpload(e.target.files?.[0]);
                  e.currentTarget.value = "";
                }}
              />

              <button
                type="button"
                onClick={pickFile}
                disabled={disabled}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>

              {draft.imageUrl ? (
                <button
                  type="button"
                  onClick={() => setDraft((p) => ({ ...p, imageUrl: "" }))}
                  disabled={disabled}
                  className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-60"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>

          <input
            value={draft.imageUrl}
            onChange={(e) =>
              setDraft((p) => ({ ...p, imageUrl: e.target.value }))
            }
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            placeholder="https://..."
            disabled={disabled}
          />

          <div className="mt-3">
            {draft.imageUrl ? (
              <img
                src={draft.imageUrl}
                alt={draft.altText || "banner"}
                className="max-h-48 w-full rounded-md bg-black/30 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="text-sm text-white/40">No image</div>
            )}
          </div>
        </div>

        {/* Type */}
        <div>
          <div className="mb-1 text-xs text-white/60">Type</div>
          <select
            value={draft.type}
            onChange={(e) =>
              setDraft((p) => ({ ...p, type: e.target.value as BannerType }))
            }
            className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white"
            disabled={disabled}
          >
            <option value="homepage">homepage</option>
            <option value="sidebar">sidebar</option>
            <option value="slideshow">slideshow</option>
          </select>
        </div>

        {/* Position */}
        <div>
          <div className="mb-1 text-xs text-white/60">Position</div>
          <input
            type="number"
            min={1}
            value={draft.position}
            onChange={(e) =>
              setDraft((p) => ({ ...p, position: Number(e.target.value || 1) }))
            }
            className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            disabled={disabled}
          />
        </div>

        {/* Link */}
        <div className="md:col-span-2">
          <div className="mb-1 text-xs text-white/60">Link URL</div>
          <input
            value={draft.linkUrl}
            onChange={(e) =>
              setDraft((p) => ({ ...p, linkUrl: e.target.value }))
            }
            className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            placeholder="https://youngdiamond.com/..."
            disabled={disabled}
          />
        </div>

        {/* Alt */}
        <div className="md:col-span-2">
          <div className="mb-1 text-xs text-white/60">Alt text</div>
          <input
            value={draft.altText}
            onChange={(e) =>
              setDraft((p) => ({ ...p, altText: e.target.value }))
            }
            className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            placeholder="Khuyến mãi Tết..."
            disabled={disabled}
          />
        </div>

        {/* Dates */}
        <div>
          <div className="mb-1 text-xs text-white/60">Start date</div>
          <input
            type="datetime-local"
            value={draft.startDate}
            onChange={(e) =>
              setDraft((p) => ({ ...p, startDate: e.target.value }))
            }
            className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            disabled={disabled}
          />
        </div>

        <div>
          <div className="mb-1 text-xs text-white/60">End date</div>
          <input
            type="datetime-local"
            value={draft.endDate}
            onChange={(e) =>
              setDraft((p) => ({ ...p, endDate: e.target.value }))
            }
            className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            disabled={disabled}
          />
        </div>

        {/* Active */}
        <div className="md:col-span-2 flex items-center gap-2">
          <input
            id="bannerActive"
            type="checkbox"
            checked={!!draft.isActive}
            onChange={(e) =>
              setDraft((p) => ({ ...p, isActive: e.target.checked }))
            }
            className="h-4 w-4"
            disabled={disabled}
          />
          <label htmlFor="bannerActive" className="text-sm text-white/80">
            Active
          </label>
        </div>
      </div>
    </AdminModal>
  );
}
