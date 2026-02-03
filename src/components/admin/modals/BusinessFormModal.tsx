// src/components/admin/modals/BusinessFormModal.tsx
import { useMemo, useState } from "react";
import AdminModal from "./AdminModal";
import type {
  BusinessForm,
  CreateBusinessFormPayload,
} from "../../../api/admin/agentRequests.api";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  initialValues?: BusinessForm;
  onClose: () => void;
  onSubmit: (payload: CreateBusinessFormPayload) => Promise<void> | void;
  submitting?: boolean;
};

type Draft = {
  name: string;
  isActive: boolean;
};

const emptyDraft: Draft = {
  name: "",
  isActive: true,
};

function buildDraft(mode: Mode, initial?: BusinessForm): Draft {
  if (mode === "edit" && initial) {
    return {
      name: initial.name ?? "",
      isActive: !!initial.isActive,
    };
  }
  return { ...emptyDraft };
}

export default function BusinessFormModal(props: Props) {
  const { open, mode, initialValues } = props;

  // Nếu đóng modal thì unmount luôn -> lần mở sau init lại từ đầu
  if (!open) return null;

  /**
   * ✅ KEY để remount khi:
   * - đổi mode create/edit
   * - đổi record (_id)
   *
   * Nhờ vậy không cần useEffect setDraft(init) nữa -> hết warning.
   */
  const modalKey = `${mode}-${initialValues?._id ?? "new"}`;

  return <BusinessFormModalInner key={modalKey} {...props} />;
}

function BusinessFormModalInner({
  open,
  mode,
  initialValues,
  onClose,
  onSubmit,
  submitting = false,
}: Props) {
  // init chỉ dùng để khởi tạo state khi mount (hoặc remount do key)
  const init = useMemo(
    () => buildDraft(mode, initialValues),
    [mode, initialValues],
  );
  const [draft, setDraft] = useState<Draft>(() => init);

  const submit = async () => {
    const name = draft.name.trim();
    if (!name) return alert("Vui lòng nhập tên hình thức kinh doanh.");

    const payload: CreateBusinessFormPayload = {
      name,
      isActive: !!draft.isActive,
    };

    await onSubmit(payload);
  };

  const disabled = submitting;

  return (
    <AdminModal
      open={open}
      title={mode === "create" ? "Add Business Form" : "Update Business Form"}
      onClose={onClose}
      widthClassName="max-w-xl"
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
      <div className="space-y-4">
        <div>
          <div className="mb-1 text-xs text-white/60">Name</div>
          <input
            value={draft.name}
            onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            placeholder="VD: Kinh doanh online"
            disabled={disabled}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="bfActive"
            type="checkbox"
            checked={!!draft.isActive}
            onChange={(e) =>
              setDraft((p) => ({ ...p, isActive: e.target.checked }))
            }
            className="h-4 w-4"
            disabled={disabled}
          />
          <label htmlFor="bfActive" className="text-sm text-white/80">
            Active
          </label>
        </div>
      </div>
    </AdminModal>
  );
}
