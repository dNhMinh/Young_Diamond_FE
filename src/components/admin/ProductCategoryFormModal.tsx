// src/components/admin/ProductCategoryFormModal.tsx
import { useMemo, useState } from "react";
import AdminModal from "./AdminModal";
import type { ProductCategoryStatus } from "../../api/admin/productCategory.api";

export type ProductCategoryFormValues = {
  title: string;
  description: string;
  status: ProductCategoryStatus;
};

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: Partial<ProductCategoryFormValues>;
  onClose: () => void;
  onSubmit: (values: ProductCategoryFormValues) => Promise<void> | void;
  submitting?: boolean;
};

const emptyDraft: ProductCategoryFormValues = {
  title: "",
  description: "",
  status: "active",
};

function mergeInitial(
  initialValues?: Partial<ProductCategoryFormValues>,
): ProductCategoryFormValues {
  return {
    ...emptyDraft,
    ...initialValues,
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    status: (initialValues?.status as ProductCategoryStatus) ?? "active",
  };
}

export default function ProductCategoryFormModal({
  open,
  mode,
  initialValues,
  onClose,
  onSubmit,
  submitting = false,
}: Props) {
  // ✅ vì modal được remount bằng key ở parent, init 1 lần là đủ
  const init = useMemo(() => mergeInitial(initialValues), [initialValues]);
  const [draft, setDraft] = useState<ProductCategoryFormValues>(init);

  const submit = async () => {
    const payload: ProductCategoryFormValues = {
      title: draft.title.trim(),
      description: draft.description ?? "",
      status: draft.status,
    };

    if (!payload.title) return alert("Vui lòng nhập title");
    await onSubmit(payload);
  };

  return (
    <AdminModal
      open={open}
      title={mode === "create" ? "Add Category" : "Update Category"}
      onClose={onClose}
      widthClassName="max-w-3xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/10"
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Saving..." : mode === "create" ? "Create" : "Update"}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-white/30"
          placeholder="Title"
          value={draft.title}
          onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
        />

        <select
          value={draft.status}
          onChange={(e) =>
            setDraft((p) => ({
              ...p,
              status: e.target.value as ProductCategoryStatus,
            }))
          }
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm"
        >
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>

        <textarea
          className="md:col-span-2 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-white/30"
          placeholder="Description"
          value={draft.description}
          onChange={(e) =>
            setDraft((p) => ({ ...p, description: e.target.value }))
          }
          rows={4}
        />
      </div>
    </AdminModal>
  );
}
