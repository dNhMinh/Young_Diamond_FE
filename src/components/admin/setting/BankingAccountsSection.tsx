import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getPaymentMethodsApi,
  getPaymentMethodDetailApi,
  addBankAccountToPaymentMethodApi,
  updateBankAccountInPaymentMethodApi,
  deleteBankAccountInPaymentMethodApi,
} from "../../../api/admin/settings.api";
import type {
  PaymentMethod,
  BankAccount,
  CreateBankAccountPayload,
  UpdateBankAccountPayload,
} from "../../../types/settings";
import BankAccountFormModal from "../modals/BankAccountFormModal";
import { getErrorMessage } from "./httpHelpers";

type Props = { active: boolean };

export default function BankingAccountsSection({ active }: Props) {
  const [bankLoading, setBankLoading] = useState(false);
  const [bankSaving, setBankSaving] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [bankingMethod, setBankingMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankModalMode, setBankModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingBank, setEditingBank] = useState<BankAccount | undefined>(
    undefined,
  );

  const filteredBankAccounts = useMemo(() => {
    const q = bankSearch.trim().toLowerCase();
    if (!q) return bankAccounts;
    return bankAccounts.filter((b) => {
      const s =
        `${b.bankName} ${b.bankCode} ${b.accountNumber} ${b.accountName}`.toLowerCase();
      return s.includes(q);
    });
  }, [bankAccounts, bankSearch]);

  const fetchBankingAccounts = useCallback(async () => {
    setBankLoading(true);
    try {
      const resPm = await getPaymentMethodsApi();
      const list = resPm.data.data ?? [];
      const banking = list.find((x) => x.code === "BANKING") ?? null;
      setBankingMethod(banking);

      if (!banking) {
        setBankAccounts([]);
        return;
      }

      const resAcc = await getPaymentMethodDetailApi(banking._id); // BankAccount[]
      setBankAccounts(resAcc.data.data ?? []);
    } catch (e: unknown) {
      console.error(e);
      alert(
        getErrorMessage(
          e,
          "Không lấy được danh sách tài khoản ngân hàng (BANKING).",
        ),
      );
    } finally {
      setBankLoading(false);
    }
  }, []);

  useEffect(() => {
    if (active) void fetchBankingAccounts();
  }, [active, fetchBankingAccounts]);

  const openCreateBank = () => {
    setBankModalMode("create");
    setEditingBank(undefined);
    setBankModalOpen(true);
  };

  const openEditBank = (b: BankAccount) => {
    setBankModalMode("edit");
    setEditingBank(b);
    setBankModalOpen(true);
  };

  const closeBankModal = () => {
    setBankModalOpen(false);
    setEditingBank(undefined);
    setBankModalMode("create");
  };

  const handleSubmitBankModal = async (
    data:
      | { mode: "create"; payload: CreateBankAccountPayload }
      | { mode: "edit"; id: string; payload: UpdateBankAccountPayload },
  ) => {
    if (!bankingMethod?._id) {
      alert(
        'Không tìm thấy phương thức "BANKING". Vui lòng tạo code = BANKING trước.',
      );
      return;
    }

    setBankSaving(true);
    try {
      if (data.mode === "create") {
        const ok = confirm(
          `Thêm bank account (${data.payload.bankCode} - ${data.payload.bankName}) ?`,
        );
        if (!ok) return;

        const res = await addBankAccountToPaymentMethodApi(
          bankingMethod._id,
          data.payload,
        );
        alert(res.data.message || "Created");
        setBankAccounts(res.data.data?.bankAccounts ?? []);
      } else {
        const ok = confirm(
          `Cập nhật bank account (${editingBank?.bankCode ?? ""}) ?`,
        );
        if (!ok) return;

        const res = await updateBankAccountInPaymentMethodApi(
          bankingMethod._id,
          data.id,
          data.payload,
        );
        alert(res.data.message || "Updated");
        setBankAccounts(res.data.data?.bankAccounts ?? []);
      }

      closeBankModal();
    } catch (e: unknown) {
      console.error(e);
      alert(getErrorMessage(e, "Thao tác bank account thất bại."));
    } finally {
      setBankSaving(false);
    }
  };

  const handleDeleteBank = async (b: BankAccount) => {
    if (!bankingMethod?._id) return;

    const ok = confirm(`Xóa bank account ${b.bankCode} - ${b.accountNumber} ?`);
    if (!ok) return;

    setBankSaving(true);
    try {
      const res = await deleteBankAccountInPaymentMethodApi(
        bankingMethod._id,
        b._id,
      );
      alert(res.data.message || "Deleted");
      setBankAccounts(res.data.data?.bankAccounts ?? []);

      if (bankModalOpen && editingBank?._id === b._id) closeBankModal();
    } catch (e: unknown) {
      console.error(e);
      alert(getErrorMessage(e, "Xóa bank account thất bại."));
    } finally {
      setBankSaving(false);
    }
  };

  return (
    <div className={active ? "block" : "hidden"}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-white/70">
            Quản lý tài khoản ngân hàng cho phương thức <b>BANKING</b>
            {bankingMethod ? (
              <span className="ml-2 text-white/60">
                (id: {bankingMethod._id})
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
              placeholder="Search bank / account..."
              className="w-72 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            />

            <button
              onClick={fetchBankingAccounts}
              disabled={bankLoading || bankSaving}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-60"
            >
              {bankLoading ? "Loading..." : "Refresh"}
            </button>

            <button
              onClick={openCreateBank}
              disabled={bankSaving || !bankingMethod}
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-60"
            >
              + Add bank account
            </button>
          </div>
        </div>

        {!bankingMethod ? (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
            Chưa có payment method <b>code = BANKING</b>. Hãy tạo ở tab “Phương
            thức thanh toán” trước.
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-white/10">
          <div className="bg-white/5 px-4 py-3 text-sm text-white/80">
            Danh sách tài khoản ({filteredBankAccounts.length})
          </div>

          {bankLoading ? (
            <div className="px-4 py-10 text-center text-white/60">
              Loading...
            </div>
          ) : filteredBankAccounts.length === 0 ? (
            <div className="px-4 py-10 text-center text-white/60">Empty</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left">Bank</th>
                  <th className="px-4 py-3 text-left">Account</th>
                  <th className="px-4 py-3 text-left">Active</th>
                  <th className="px-4 py-3 text-left">QR</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBankAccounts.map((b) => (
                  <tr
                    key={b._id}
                    className="border-t border-white/5 hover:bg-white/5"
                  >
                    <td className="px-4 py-3 text-white">
                      <div className="font-medium">{b.bankName}</div>
                      <div className="text-xs text-white/60">{b.bankCode}</div>
                    </td>

                    <td className="px-4 py-3 text-white">
                      <div className="text-xs text-white/70">
                        {b.accountName}
                      </div>
                      <div className="font-medium">{b.accountNumber}</div>
                    </td>

                    <td className="px-4 py-3">
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

                    <td className="px-4 py-3">
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

                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditBank(b)}
                          disabled={bankSaving}
                          className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white hover:bg-white/10 disabled:opacity-60"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBank(b)}
                          disabled={bankSaving}
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

        {bankModalOpen ? (
          <BankAccountFormModal
            key={`${bankModalMode}-${editingBank?._id ?? "new"}`}
            open={bankModalOpen}
            mode={bankModalMode}
            initialValues={editingBank}
            onClose={closeBankModal}
            onSubmit={handleSubmitBankModal}
            submitting={bankSaving}
          />
        ) : null}
      </div>
    </div>
  );
}
