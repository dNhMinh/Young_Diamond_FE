import { useMemo, useState } from "react";
import AdminModal from "./AdminModal";
import type {
  PaymentMethod,
  PaymentMethodType,
  CreatePaymentMethodPayload,
  UpdatePaymentMethodPayload,
} from "../../../types/settings";

type Mode = "create" | "edit" | "view";

type Props = {
  open: boolean;
  mode: Mode;
  initialValues?: PaymentMethod;
  onClose: () => void;
  onSubmit?: (
    data:
      | { mode: "create"; payload: CreatePaymentMethodPayload }
      | { mode: "edit"; id: string; payload: UpdatePaymentMethodPayload },
  ) => Promise<void> | void;
  submitting?: boolean;
};

type Draft = {
  code: string;
  name: string;
  type: PaymentMethodType;
  isActive: boolean;
};

const emptyDraft: Draft = {
  code: "",
  name: "",
  type: "OFFLINE",
  isActive: true,
};

function buildDraft(mode: Mode, initial?: PaymentMethod): Draft {
  if ((mode === "edit" || mode === "view") && initial) {
    return {
      code: initial.code ?? "",
      name: initial.name ?? "",
      type: (initial.type ?? "OFFLINE") as PaymentMethodType,
      isActive: !!initial.isActive,
    };
  }
  return { ...emptyDraft };
}

export default function PaymentMethodFormModal({
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

  const title = useMemo(() => {
    if (mode === "create") return "Add Payment Method";
    if (mode === "view")
      return `Payment Method Detail (${initialValues?.code ?? ""})`;
    return `Update Payment Method (${initialValues?.code ?? ""})`;
  }, [mode, initialValues?.code]);

  if (!open) return null;

  const readonly = mode === "view";
  const codeLocked = mode !== "create"; // swagger update không có code

  const submit = async () => {
    if (!onSubmit) return;

    const code = draft.code.trim();
    const name = draft.name.trim();

    if (mode === "create") {
      if (!code)
        return alert("Vui lòng nhập code (mã) phương thức thanh toán.");
      if (!name) return alert("Vui lòng nhập tên phương thức thanh toán.");

      const payload: CreatePaymentMethodPayload = {
        code,
        name,
        type: draft.type,
        isActive: !!draft.isActive,
      };

      await onSubmit({ mode: "create", payload });
      return;
    }

    if (mode === "edit") {
      if (!initialValues?._id) return alert("Thiếu id phương thức thanh toán.");
      if (!name)
        return alert("Tên phương thức thanh toán không được để trống.");

      const payload: UpdatePaymentMethodPayload = {
        name,
        type: draft.type,
        isActive: !!draft.isActive,
      };

      await onSubmit({ mode: "edit", id: initialValues._id, payload });
    }
  };

  const footer =
    mode === "view" ? (
      <button
        onClick={onClose}
        className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/10"
      >
        Close
      </button>
    ) : (
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
    );

  return (
    <AdminModal
      open={open}
      title={title}
      onClose={onClose}
      widthClassName="max-w-3xl"
      footer={footer}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Code */}
        <div>
          <div className="mb-1 text-xs text-white/60">Code (unique)</div>
          <input
            value={draft.code}
            onChange={(e) => setDraft((p) => ({ ...p, code: e.target.value }))}
            disabled={readonly || codeLocked}
            className={[
              "w-full rounded-lg border border-white/10 px-3 py-2 text-sm outline-none",
              readonly || codeLocked
                ? "bg-black/30 text-white/70"
                : "bg-[#0f0f0f] text-white focus:border-white/30",
            ].join(" ")}
            placeholder="VD: COD / BANKING"
          />
          {codeLocked ? (
            <div className="mt-1 text-[11px] text-white/40">
              * Update theo swagger: body không cần code.
            </div>
          ) : null}
        </div>

        {/* Name */}
        <div>
          <div className="mb-1 text-xs text-white/60">Name</div>
          <input
            value={draft.name}
            onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
            disabled={readonly}
            className={[
              "w-full rounded-lg border border-white/10 px-3 py-2 text-sm outline-none",
              readonly
                ? "bg-black/30 text-white/70"
                : "bg-[#0f0f0f] text-white focus:border-white/30",
            ].join(" ")}
            placeholder="VD: Thanh toán khi nhận hàng"
          />
        </div>

        {/* Type */}
        <div>
          <div className="mb-1 text-xs text-white/60">Type</div>
          <select
            value={draft.type}
            onChange={(e) =>
              setDraft((p) => ({
                ...p,
                type: e.target.value as PaymentMethodType,
              }))
            }
            disabled={readonly}
            className={[
              "w-full rounded-lg border border-white/10 px-3 py-2 text-sm outline-none",
              readonly
                ? "bg-black/30 text-white/70"
                : "bg-[#0f0f0f] text-white focus:border-white/30",
            ].join(" ")}
          >
            <option value="OFFLINE">OFFLINE</option>
            <option value="ONLINE">ONLINE</option>
          </select>
        </div>

        {/* Active */}
        <div className="flex items-center gap-2 md:mt-6">
          <input
            id="pmActive"
            type="checkbox"
            checked={!!draft.isActive}
            disabled={readonly}
            onChange={(e) =>
              setDraft((p) => ({ ...p, isActive: e.target.checked }))
            }
            className="h-4 w-4"
          />
          <label htmlFor="pmActive" className="text-sm text-white/80">
            Active
          </label>
        </div>

        {/* Bank accounts detail (view/edit) */}
        {mode !== "create" ? (
          <div className="md:col-span-2 mt-2 rounded-xl border border-white/10 bg-[#0f0f0f] p-3">
            <div className="mb-2 text-sm font-medium text-white/90">
              Bank accounts ({initialValues?.bankAccounts?.length ?? 0})
            </div>

            {(initialValues?.bankAccounts?.length ?? 0) === 0 ? (
              <div className="text-sm text-white/50">Empty</div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-gray-300">
                    <tr>
                      <th className="px-3 py-2 text-left">Bank</th>
                      <th className="px-3 py-2 text-left">Account</th>
                      <th className="px-3 py-2 text-left">Active</th>
                      <th className="px-3 py-2 text-left">QR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialValues!.bankAccounts.map((b) => (
                      <tr key={b._id} className="border-t border-white/5">
                        <td className="px-3 py-2 text-white">
                          <div className="font-medium">{b.bankName}</div>
                          <div className="text-xs text-white/60">
                            {b.bankCode}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-white">
                          <div className="text-xs text-white/70">
                            {b.accountName}
                          </div>
                          <div className="font-medium">{b.accountNumber}</div>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={[
                              "inline-flex rounded-full border px-2 py-1 text-xs",
                              b.isActive
                                ? "border-green-500/30 bg-green-500/15 text-green-300"
                                : "border-white/10 bg-white/5 text-white/60",
                            ].join(" ")}
                          >
                            {b.isActive ? "active" : "inactive"}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {b.qrImageUrl ? (
                            <img
                              src={b.qrImageUrl}
                              alt="QR"
                              className="h-10 w-20 rounded bg-black/30 object-contain"
                              onError={(e) => {
                                (
                                  e.currentTarget as HTMLImageElement
                                ).style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="text-xs text-white/50">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </AdminModal>
  );
}
