import { useEffect, useMemo, useState } from "react";
import AdminModal from "./AdminModal";
import { uploadToCloudinary } from "../../../utils/cloudinary";
import type {
  BankAccount,
  CreateBankAccountPayload,
  UpdateBankAccountPayload,
} from "../../../types/settings";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  initialValues?: BankAccount;
  onClose: () => void;
  onSubmit: (
    data:
      | { mode: "create"; payload: CreateBankAccountPayload }
      | { mode: "edit"; id: string; payload: UpdateBankAccountPayload },
  ) => Promise<void> | void;
  submitting?: boolean;
};

type Draft = {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  qrImageUrl: string; // ✅ sẽ được set sau khi upload
  isActive: boolean;
};

const emptyDraft: Draft = {
  bankName: "",
  bankCode: "",
  accountNumber: "",
  accountName: "",
  qrImageUrl: "",
  isActive: true,
};

function buildDraft(mode: Mode, initial?: BankAccount): Draft {
  if (mode === "edit" && initial) {
    return {
      bankName: initial.bankName ?? "",
      bankCode: initial.bankCode ?? "",
      accountNumber: initial.accountNumber ?? "",
      accountName: initial.accountName ?? "",
      qrImageUrl: initial.qrImageUrl ?? "",
      isActive: !!initial.isActive,
    };
  }
  return { ...emptyDraft };
}

function toOptionalTrim(s: string): string | undefined {
  const v = s.trim();
  return v ? v : undefined;
}

export default function BankAccountFormModal({
  open,
  mode,
  initialValues,
  onClose,
  onSubmit,
  submitting = false,
}: Props) {
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
      ? "Add Bank Account"
      : `Update Bank Account (${initialValues?.bankCode ?? ""})`;
  }, [mode, initialValues?.bankCode]);

  if (!open) return null;

  const handlePickQrFile = async (file: File) => {
    // preview local ngay lập tức
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    const tmp = URL.createObjectURL(file);
    setLocalPreviewUrl(tmp);

    setUploading(true);
    try {
      const uploaded = await uploadToCloudinary(file);
      setDraft((p) => ({ ...p, qrImageUrl: uploaded.secure_url }));
    } catch (e: unknown) {
      console.error(e);
      alert(
        e instanceof Error
          ? e.message
          : "Upload QR thất bại. Kiểm tra Cloudinary config.",
      );
      // nếu upload fail thì vẫn giữ preview local, nhưng không set url
      setDraft((p) => ({ ...p, qrImageUrl: p.qrImageUrl ?? "" }));
    } finally {
      setUploading(false);
    }
  };

  const removeQr = () => {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl(null);
    setDraft((p) => ({ ...p, qrImageUrl: "" }));
  };

  const submit = async () => {
    if (uploading) return;

    const bankName = draft.bankName.trim();
    const bankCode = draft.bankCode.trim();
    const accountNumber = draft.accountNumber.trim();
    const accountName = draft.accountName.trim();

    if (!bankName) return alert("Vui lòng nhập tên ngân hàng.");
    if (!bankCode) return alert("Vui lòng nhập mã ngân hàng.");
    if (!accountNumber) return alert("Vui lòng nhập số tài khoản.");
    if (!accountName) return alert("Vui lòng nhập tên chủ tài khoản.");

    if (mode === "create") {
      const payload: CreateBankAccountPayload = {
        bankName,
        bankCode,
        accountNumber,
        accountName,
        qrImageUrl: toOptionalTrim(draft.qrImageUrl),
        isActive: !!draft.isActive,
      };
      await onSubmit({ mode: "create", payload });
      return;
    }

    if (!initialValues?._id) return alert("Thiếu id bank account.");

    const payload: UpdateBankAccountPayload = {
      bankName,
      bankCode,
      accountNumber,
      accountName,
      qrImageUrl: toOptionalTrim(draft.qrImageUrl),
      isActive: !!draft.isActive,
    };

    await onSubmit({ mode: "edit", id: initialValues._id, payload });
  };

  const disabled = submitting || uploading;

  return (
    <AdminModal
      open={open}
      title={title}
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
        <div>
          <div className="mb-1 text-xs text-white/60">Bank name</div>
          <input
            value={draft.bankName}
            onChange={(e) =>
              setDraft((p) => ({ ...p, bankName: e.target.value }))
            }
            className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            placeholder="Vietcombank"
          />
        </div>

        <div>
          <div className="mb-1 text-xs text-white/60">Bank code</div>
          <input
            value={draft.bankCode}
            onChange={(e) =>
              setDraft((p) => ({ ...p, bankCode: e.target.value }))
            }
            className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            placeholder="VCB"
          />
        </div>

        <div>
          <div className="mb-1 text-xs text-white/60">Account number</div>
          <input
            value={draft.accountNumber}
            onChange={(e) =>
              setDraft((p) => ({ ...p, accountNumber: e.target.value }))
            }
            className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            placeholder="0123456789"
          />
        </div>

        <div>
          <div className="mb-1 text-xs text-white/60">Account name</div>
          <input
            value={draft.accountName}
            onChange={(e) =>
              setDraft((p) => ({ ...p, accountName: e.target.value }))
            }
            className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            placeholder="Công ty Young Diamond"
          />
        </div>

        {/* ✅ Upload QR (replace input URL) */}
        <div className="md:col-span-2">
          <div className="mb-1 text-xs text-white/60">QR image</div>

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
                  if (f) void handlePickQrFile(f);
                  // reset input để chọn lại cùng 1 file vẫn trigger onChange
                  e.currentTarget.value = "";
                }}
              />
              {uploading ? "Uploading..." : "Upload QR"}
            </label>

            <button
              type="button"
              onClick={removeQr}
              disabled={disabled || (!draft.qrImageUrl && !localPreviewUrl)}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-60"
            >
              Remove
            </button>

            {/* show uploaded url as readonly */}
            <div className="min-w-[240px] flex-1 text-xs text-white/60">
              {draft.qrImageUrl ? (
                <span className="break-all">URL: {draft.qrImageUrl}</span>
              ) : (
                <span>No uploaded URL</span>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <input
            id="baActive"
            type="checkbox"
            checked={!!draft.isActive}
            onChange={(e) =>
              setDraft((p) => ({ ...p, isActive: e.target.checked }))
            }
            className="h-4 w-4"
            disabled={disabled}
          />
          <label htmlFor="baActive" className="text-sm text-white/80">
            Active
          </label>
        </div>

        {/* Preview */}
        <div className="md:col-span-2 rounded-lg border border-white/10 bg-[#0f0f0f] p-3">
          <div className="mb-2 text-xs text-white/60">QR preview</div>

          {localPreviewUrl || draft.qrImageUrl.trim() ? (
            <img
              src={localPreviewUrl ?? draft.qrImageUrl}
              alt="QR"
              className="max-h-56 w-full rounded-md object-contain"
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
