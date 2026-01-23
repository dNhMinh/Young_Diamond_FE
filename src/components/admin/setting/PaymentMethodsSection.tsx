//src/components/admin/setting/PaymentMethodsSection.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getPaymentMethodsApi,
  getPaymentMethodDetailApi, // returns BankAccount[]
  createPaymentMethodApi,
  updatePaymentMethodApi,
  deletePaymentMethodApi,
} from "../../../api/admin/settings.api";
import type {
  PaymentMethod,
  CreatePaymentMethodPayload,
  UpdatePaymentMethodPayload,
} from "../../../types/settings";
import PaymentMethodFormModal from "../modals/PaymentMethodFormModal";
import { getErrorMessage, isHttpErrorLike } from "./httpHelpers";

type Props = { active: boolean };

export default function PaymentMethodsSection({ active }: Props) {
  const [payLoading, setPayLoading] = useState(false);
  const [paySaving, setPaySaving] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paySearch, setPaySearch] = useState("");

  const [pmModalOpen, setPmModalOpen] = useState(false);
  const [pmModalMode, setPmModalMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [editingPm, setEditingPm] = useState<PaymentMethod | undefined>(
    undefined,
  );

  const filteredPaymentMethods = useMemo(() => {
    const q = paySearch.trim().toLowerCase();
    if (!q) return paymentMethods;
    return paymentMethods.filter((p) => {
      const s = `${p.code} ${p.name} ${p.type}`.toLowerCase();
      return s.includes(q);
    });
  }, [paymentMethods, paySearch]);

  const fetchPaymentMethods = useCallback(async () => {
    setPayLoading(true);
    try {
      const res = await getPaymentMethodsApi();
      setPaymentMethods(res.data.data ?? []);
    } catch (e: unknown) {
      if (isHttpErrorLike(e) && e.response?.status === 404) {
        setPaymentMethods([]);
      } else {
        console.error(e);
        alert(
          getErrorMessage(
            e,
            "Không lấy được danh sách phương thức thanh toán.",
          ),
        );
      }
    } finally {
      setPayLoading(false);
    }
  }, []);

  useEffect(() => {
    if (active) void fetchPaymentMethods();
  }, [active, fetchPaymentMethods]);

  const openCreatePm = () => {
    setPmModalMode("create");
    setEditingPm(undefined);
    setPmModalOpen(true);
  };

  const openEditPm = (pm: PaymentMethod) => {
    setPmModalMode("edit");
    setEditingPm(pm);
    setPmModalOpen(true);
  };

  // View: mở modal trước, sau đó fetch bankAccounts
  const openViewPm = async (pm: PaymentMethod) => {
    if (pm.code !== "BANKING") return; // chỉ view được BANKING
    setPmModalMode("view");
    setEditingPm(pm);
    setPmModalOpen(true);

    setPaySaving(true);
    try {
      const res = await getPaymentMethodDetailApi(pm._id); // BankAccount[]
      const bankAccounts = res.data.data ?? [];
      setEditingPm((prev) => {
        if (prev?._id === pm._id) return { ...prev, bankAccounts };
        return { ...pm, bankAccounts };
      });
    } catch (e: unknown) {
      console.error(e);
      alert(
        getErrorMessage(e, "Không lấy được danh sách tài khoản ngân hàng."),
      );
    } finally {
      setPaySaving(false);
    }
  };

  const closePmModal = () => {
    setPmModalOpen(false);
    setEditingPm(undefined);
    setPmModalMode("create");
  };

  const handleSubmitPmModal = async (
    data:
      | { mode: "create"; payload: CreatePaymentMethodPayload }
      | { mode: "edit"; id: string; payload: UpdatePaymentMethodPayload },
  ) => {
    setPaySaving(true);
    try {
      if (data.mode === "create") {
        const ok = confirm(
          `Tạo phương thức "${data.payload.name}" (code: ${data.payload.code}) ?`,
        );
        if (!ok) return;

        const res = await createPaymentMethodApi(data.payload);
        alert(res.data.message || "Created");
      } else {
        const ok = confirm(
          `Cập nhật phương thức "${data.payload.name ?? ""}" ?`,
        );
        if (!ok) return;

        const res = await updatePaymentMethodApi(data.id, data.payload);
        alert(res.data.message || "Updated");
      }

      closePmModal();
      await fetchPaymentMethods();
    } catch (e: unknown) {
      console.error(e);
      alert(getErrorMessage(e, "Thao tác thất bại."));
    } finally {
      setPaySaving(false);
    }
  };

  const handleDeletePm = async (pm: PaymentMethod) => {
    const ok = confirm(`Xóa phương thức "${pm.name}" (code: ${pm.code}) ?`);
    if (!ok) return;

    setPaySaving(true);
    try {
      const res = await deletePaymentMethodApi(pm._id);
      alert(res.data.message || "Deleted");

      if (pmModalOpen && editingPm?._id === pm._id) {
        closePmModal();
      }

      await fetchPaymentMethods();
    } catch (e: unknown) {
      console.error(e);
      alert(getErrorMessage(e, "Xóa thất bại."));
    } finally {
      setPaySaving(false);
    }
  };

  return (
    <div className={active ? "block" : "hidden"}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-white/70">
            Quản lý phương thức thanh toán
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              value={paySearch}
              onChange={(e) => setPaySearch(e.target.value)}
              placeholder="Search code / name..."
              className="w-64 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            />

            <button
              onClick={fetchPaymentMethods}
              disabled={payLoading || paySaving}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-60"
            >
              {payLoading ? "Loading..." : "Refresh"}
            </button>

            <button
              onClick={openCreatePm}
              disabled={paySaving}
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-60"
            >
              + Add method
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10">
          <div className="bg-white/5 px-4 py-3 text-sm text-white/80">
            Danh sách phương thức thanh toán ({filteredPaymentMethods.length})
          </div>

          {payLoading ? (
            <div className="px-4 py-10 text-center text-white/60">
              Loading...
            </div>
          ) : filteredPaymentMethods.length === 0 ? (
            <div className="px-4 py-10 text-center text-white/60">Empty</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Active</th>
                  <th className="px-4 py-3 text-left">Bank accounts</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPaymentMethods.map((p) => (
                  <tr
                    key={p._id}
                    className="border-t border-white/5 hover:bg-white/5"
                  >
                    <td className="px-4 py-3 text-white">{p.code}</td>

                    <td className="px-4 py-3 text-white">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-white/60">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleString()
                          : ""}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={[
                          "inline-flex rounded-full border px-2 py-1 text-xs",
                          p.type === "ONLINE"
                            ? "border-blue-500/30 bg-blue-500/15 text-blue-300"
                            : "border-white/10 bg-white/5 text-white/70",
                        ].join(" ")}
                      >
                        {p.type}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={[
                          "inline-flex rounded-full border px-2 py-1 text-xs",
                          p.isActive
                            ? "border-green-500/30 bg-green-500/15 text-green-300"
                            : "border-white/10 bg-white/5 text-white/60",
                        ].join(" ")}
                      >
                        {p.isActive ? "active" : "inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-white/80">
                      {p.bankAccounts?.length ?? 0}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {p.code === "BANKING" ? (
                          <button
                            onClick={() => openViewPm(p)}
                            disabled={paySaving}
                            className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white hover:bg-white/10 disabled:opacity-60"
                          >
                            View
                          </button>
                        ) : null}
                        <button
                          onClick={() => openEditPm(p)}
                          disabled={paySaving}
                          className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white hover:bg-white/10 disabled:opacity-60"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePm(p)}
                          disabled={paySaving}
                          className="rounded-lg border border-red-500/40 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pmModalOpen ? (
          <PaymentMethodFormModal
            key={`${pmModalMode}-${editingPm?._id ?? "new"}`}
            open={pmModalOpen}
            mode={pmModalMode}
            initialValues={editingPm}
            onClose={closePmModal}
            onSubmit={pmModalMode === "view" ? undefined : handleSubmitPmModal}
            submitting={paySaving}
          />
        ) : null}
      </div>
    </div>
  );
}
