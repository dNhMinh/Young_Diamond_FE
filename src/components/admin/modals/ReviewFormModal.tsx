import { useMemo, useState } from "react";
import AdminModal from "./AdminModal";
import type { ReviewFormValues, ReviewItem } from "../../../types/review";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: Partial<ReviewItem>;
  onClose: () => void;
  onSubmit: (values: ReviewFormValues) => Promise<void> | void;
  submitting?: boolean;
};

const emptyDraft: ReviewFormValues = {
  fullName: "",
  email: "",
  content: "",
};

function mergeInitial(initialValues?: Partial<ReviewItem>): ReviewFormValues {
  return {
    ...emptyDraft,
    fullName: initialValues?.fullName ?? "",
    email: initialValues?.email ?? "",
    content: initialValues?.content ?? "",
  };
}

export default function ReviewFormModal({
  open,
  mode,
  initialValues,
  onClose,
  onSubmit,
  submitting = false,
}: Props) {
  // ✅ init 1 lần, tránh setState trong effect
  const init = useMemo(() => mergeInitial(initialValues), [initialValues]);
  const [draft, setDraft] = useState<ReviewFormValues>(init);

  const submit = async () => {
    const payload: ReviewFormValues = {
      fullName: draft.fullName.trim(),
      email: draft.email.trim(),
      content: draft.content.trim(),
    };

    if (!payload.fullName) return alert("Vui lòng nhập fullName");
    if (!payload.email) return alert("Vui lòng nhập email");
    if (!payload.content) return alert("Vui lòng nhập content");

    await onSubmit(payload);
  };

  return (
    <AdminModal
      open={open}
      title={mode === "create" ? "Add Testimonial" : "Update Testimonial"}
      onClose={onClose}
      widthClassName="max-w-2xl"
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
      <div className="grid grid-cols-1 gap-3">
        <input
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-white/30"
          placeholder="Full name"
          value={draft.fullName}
          onChange={(e) =>
            setDraft((p) => ({ ...p, fullName: e.target.value }))
          }
        />

        <input
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-white/30"
          placeholder="Email"
          value={draft.email}
          onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
        />

        <textarea
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-white/30"
          placeholder="Content"
          value={draft.content}
          onChange={(e) => setDraft((p) => ({ ...p, content: e.target.value }))}
          rows={5}
        />
      </div>
    </AdminModal>
  );
}
