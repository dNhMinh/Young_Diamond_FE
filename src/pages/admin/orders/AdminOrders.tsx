// src/pages/admin/orders/AdminOrdersPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAdminOrdersApi,
  updateOrderPaymentStatusApi,
  updateMultiOrderPaymentStatusApi,
  updateOrderStatusApi,
  updateMultiOrderStatusApi,
} from "../../../api/admin/order.api";
import type {
  OrderListItem,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from "../../../types/order";
import { useChatNotification } from "../../../hooks/useChatNotification";

type StatusFilter = "all" | OrderStatus;
type PaymentStatusFilter = "all" | PaymentStatus;
type PaymentMethodFilter = "all" | PaymentMethod;

const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  shipped: "bg-purple-500/20 text-purple-400",
  delayed: "bg-orange-500/20 text-orange-400",
  delivered: "bg-green-500/20 text-green-400",
  failed: "bg-red-500/20 text-red-400",
};

const PAYMENT_STATUS_STYLE: Record<PaymentStatus, string> = {
  pending: "bg-gray-500/20 text-gray-300",
  paid: "bg-green-500/20 text-green-400",
  failed: "bg-red-500/20 text-red-400",
};

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cod: "COD",
  bank_transfer: "Bank transfer",
};

const DROPDOWN_OPTION_CLASS = "bg-[#0f0f0f] text-white hover:bg-white/10";

export default function AdminOrders() {
  const { setOrdersPageActive } = useChatNotification();
  const [items, setItems] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState<StatusFilter>("all");
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatusFilter>("all");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodFilter>("all");
  const [searchKey, setSearchKey] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // update payment từng dòng
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(
    null,
  );

  // update status từng dòng
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // ✅ chọn nhiều
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // bulk payment
  const [bulkPaymentStatus, setBulkPaymentStatus] =
    useState<PaymentStatus>("paid");
  const [bulkPaymentUpdating, setBulkPaymentUpdating] = useState(false);

  // bulk status
  const [bulkOrderStatus, setBulkOrderStatus] =
    useState<OrderStatus>("confirmed");
  const [bulkStatusUpdating, setBulkStatusUpdating] = useState(false);

  const anyBulkUpdating = bulkPaymentUpdating || bulkStatusUpdating;

  useEffect(() => {
    setOrdersPageActive(true);
    return () => setOrdersPageActive(false);
  }, [setOrdersPageActive]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getAdminOrdersApi({
        status,
        paymentStatus,
        paymentMethod,
      });
      setItems(res.data.data ?? []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, paymentStatus, paymentMethod]);

  // const filtered = useMemo(() => {
  //   const q = searchKey.trim().toLowerCase();
  //   if (!q) return items;
  //   return items.filter((o) => (o.orderCode ?? "").toLowerCase().includes(q));
  // }, [items, searchKey]);
  const filtered = useMemo(() => {
    const q = searchKey.trim().toLowerCase();

    return items.filter((o) => {
      const matchSearch = q
        ? (o.orderCode ?? "").toLowerCase().includes(q)
        : true;

      const createdTs = o.createdAt ? new Date(o.createdAt).getTime() : null;

      const fromTs = fromDate
        ? new Date(`${fromDate}T00:00:00`).getTime()
        : null;

      const toTs = toDate ? new Date(`${toDate}T23:59:59.999`).getTime() : null;

      const matchFrom =
        fromTs === null || (createdTs !== null && createdTs >= fromTs);

      const matchTo =
        toTs === null || (createdTs !== null && createdTs <= toTs);

      return matchSearch && matchFrom && matchTo;
    });
  }, [items, searchKey, fromDate, toDate]);

  // ✅ các id đang được tick trong list hiện tại
  const selectedInFiltered = useMemo(() => {
    return filtered.filter((o) => selectedIds.has(o._id)).map((o) => o._id);
  }, [filtered, selectedIds]);

  const selectedCount = selectedInFiltered.length;
  const allFilteredSelected =
    filtered.length > 0 && selectedCount === filtered.length;

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filtered.forEach((o) => next.delete(o._id));
      } else {
        filtered.forEach((o) => next.add(o._id));
      }
      return next;
    });
  };

  const clearSelected = () => setSelectedIds(new Set());

  const handleUpdatePayment = async (orderId: string, next: PaymentStatus) => {
    const current: PaymentStatus =
      items.find((x) => x._id === orderId)?.paymentStatus ?? "pending";
    if (next === current) return;

    const ok = confirm(`Cập nhật paymentStatus: ${current} → ${next} ?`);
    if (!ok) return;

    setUpdatingPaymentId(orderId);

    // optimistic
    setItems((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, paymentStatus: next } : o)),
    );

    try {
      const res = await updateOrderPaymentStatusApi(orderId, next);
      alert(res.data.message || "Updated payment status");
    } catch (e) {
      console.error(e);
      alert("Update payment status failed");
      // revert
      setItems((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, paymentStatus: current } : o,
        ),
      );
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const handleBulkUpdatePayment = async () => {
    if (selectedInFiltered.length === 0) return alert("Bạn chưa chọn đơn nào.");

    const ok = confirm(
      `Cập nhật paymentStatus = "${bulkPaymentStatus}" cho ${selectedInFiltered.length} đơn hàng?`,
    );
    if (!ok) return;

    setBulkPaymentUpdating(true);

    const prevMap = new Map<string, PaymentStatus>();
    items.forEach((o) => {
      if (selectedInFiltered.includes(o._id)) {
        prevMap.set(o._id, o.paymentStatus ?? "pending");
      }
    });

    // optimistic
    setItems((prev) =>
      prev.map((o) =>
        selectedInFiltered.includes(o._id)
          ? { ...o, paymentStatus: bulkPaymentStatus }
          : o,
      ),
    );

    try {
      const res = await updateMultiOrderPaymentStatusApi(
        selectedInFiltered,
        bulkPaymentStatus,
      );
      const r = res.data.data;
      alert(
        `${res.data.message || "Bulk updated"} (modified: ${r?.modifiedCount ?? 0})`,
      );
      clearSelected();
    } catch (e) {
      console.error(e);
      alert("Bulk update failed");

      // revert
      setItems((prev) =>
        prev.map((o) => {
          const old = prevMap.get(o._id);
          return old ? { ...o, paymentStatus: old } : o;
        }),
      );
    } finally {
      setBulkPaymentUpdating(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, next: OrderStatus) => {
    const currentRow = items.find((x) => x._id === orderId);
    const current: OrderStatus = currentRow?.status ?? "pending";
    if (next === current) return;

    if (current === "delivered") {
      return alert(
        'Đơn hàng đã "delivered" nên không thể cập nhật trạng thái.',
      );
    }

    const ok = confirm(`Cập nhật status: ${current} → ${next} ?`);
    if (!ok) return;

    // ✅ nếu chuyển sang failed -> bắt nhập lý do
    let reason: string | undefined = undefined;
    if (next === "failed") {
      const input = prompt(
        "Nhập lý do hủy/thất bại (failReason):",
        currentRow?.failReason ?? "",
      );

      if (input === null) return; // user cancel
      const v = input.trim();
      if (!v) {
        alert("Vui lòng nhập lý do (failReason).");
        return;
      }
      reason = v;
    }

    setUpdatingStatusId(orderId);

    // optimistic (đồng bộ rule BE: non-failed -> failReason null)
    setItems((prev) =>
      prev.map((o) =>
        o._id === orderId
          ? {
              ...o,
              status: next,
              failReason: next === "failed" ? reason : null,
            }
          : o,
      ),
    );

    try {
      const res = await updateOrderStatusApi(orderId, next, reason);
      alert(res.data.message || "Updated order status");
      await fetchOrders();
    } catch (e) {
      console.error(e);
      alert("Update order status failed");

      // revert
      setItems((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? {
                ...o,
                status: current,
                failReason: currentRow?.failReason ?? o.failReason ?? null,
              }
            : o,
        ),
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (selectedInFiltered.length === 0) return alert("Bạn chưa chọn đơn nào.");

    const selectedRows = items.filter((o) =>
      selectedInFiltered.includes(o._id),
    );
    const hasDelivered = selectedRows.some((o) => o.status === "delivered");
    if (hasDelivered) {
      return alert(
        'Trong selection có đơn "delivered" nên không thể bulk update (API sẽ fail).',
      );
    }

    const ok = confirm(
      `Cập nhật status = "${bulkOrderStatus}" cho ${selectedInFiltered.length} đơn hàng?`,
    );
    if (!ok) return;

    // ✅ nếu bulk sang failed -> bắt nhập lý do
    let reason: string | undefined = undefined;
    if (bulkOrderStatus === "failed") {
      const input = prompt(
        "Nhập lý do hủy/thất bại (failReason) cho các đơn:",
        "",
      );
      if (input === null) return;
      const v = input.trim();
      if (!v) {
        alert("Vui lòng nhập lý do (failReason).");
        return;
      }
      reason = v;
    }

    setBulkStatusUpdating(true);

    const prevMap = new Map<
      string,
      { status: OrderStatus; failReason?: string | null }
    >();
    items.forEach((o) => {
      if (selectedInFiltered.includes(o._id)) {
        prevMap.set(o._id, {
          status: o.status,
          failReason: o.failReason ?? null,
        });
      }
    });

    // optimistic
    setItems((prev) =>
      prev.map((o) =>
        selectedInFiltered.includes(o._id)
          ? {
              ...o,
              status: bulkOrderStatus,
              // đồng bộ UI: non-failed thì không còn reason
              // failReason: bulkOrderStatus === "failed" ? reason : null,
              failReason:
                bulkOrderStatus === "failed" ? reason : (o.failReason ?? null),
            }
          : o,
      ),
    );

    try {
      const res = await updateMultiOrderStatusApi(
        selectedInFiltered,
        bulkOrderStatus,
        reason,
      );
      const r = res.data.data;
      alert(
        `${res.data.message || "Bulk updated"} (modified: ${r?.modifiedCount ?? 0})`,
      );
      clearSelected();
      await fetchOrders();
    } catch (e) {
      console.error(e);
      alert("Bulk update status failed");

      // revert
      setItems((prev) =>
        prev.map((o) => {
          const old = prevMap.get(o._id);
          return old
            ? { ...o, status: old.status, failReason: old.failReason }
            : o;
        }),
      );
    } finally {
      setBulkStatusUpdating(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Orders</h2>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          className="w-72 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          placeholder="Search order code..."
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white"
          style={{ colorScheme: "dark" }}>
          <option value="all" className={DROPDOWN_OPTION_CLASS}>
            All
          </option>
          <option value="pending" className={DROPDOWN_OPTION_CLASS}>
            pending
          </option>
          <option value="confirmed" className={DROPDOWN_OPTION_CLASS}>
            confirmed
          </option>
          <option value="shipped" className={DROPDOWN_OPTION_CLASS}>
            shipped
          </option>
          <option value="delayed" className={DROPDOWN_OPTION_CLASS}>
            delayed
          </option>
          <option value="delivered" className={DROPDOWN_OPTION_CLASS}>
            delivered
          </option>
          <option value="failed" className={DROPDOWN_OPTION_CLASS}>
            failed
          </option>
        </select>

        <select
          value={paymentStatus}
          onChange={(e) =>
            setPaymentStatus(e.target.value as PaymentStatusFilter)
          }
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white"
          style={{ colorScheme: "dark" }}>
          <option value="all" className={DROPDOWN_OPTION_CLASS}>
            All payment
          </option>
          <option value="pending" className={DROPDOWN_OPTION_CLASS}>
            pending
          </option>
          <option value="paid" className={DROPDOWN_OPTION_CLASS}>
            paid
          </option>
          <option value="failed" className={DROPDOWN_OPTION_CLASS}>
            failed
          </option>
        </select>

        <select
          value={paymentMethod}
          onChange={(e) =>
            setPaymentMethod(e.target.value as PaymentMethodFilter)
          }
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white"
          style={{ colorScheme: "dark" }}>
          <option value="all" className={DROPDOWN_OPTION_CLASS}>
            All method
          </option>
          <option value="cod" className={DROPDOWN_OPTION_CLASS}>
            COD
          </option>
          <option value="bank_transfer" className={DROPDOWN_OPTION_CLASS}>
            Bank transfer
          </option>
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white"
          title="Từ ngày"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white"
          title="Đến ngày"
        />

        <button
          type="button"
          onClick={() => {
            setFromDate("");
            setToDate("");
          }}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10">
          Clear date
        </button>
      </div>

      {/* Bulk actions */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="text-sm text-gray-300">
          Selected (in current list):{" "}
          <span className="font-semibold text-white">{selectedCount}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={toggleSelectAllFiltered}
            className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white hover:bg-white/10 disabled:opacity-60"
            disabled={filtered.length === 0 || anyBulkUpdating}>
            {allFilteredSelected ? "Unselect All" : "Select All"}
          </button>

          <button
            onClick={clearSelected}
            className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white hover:bg-white/10 disabled:opacity-60"
            disabled={selectedCount === 0 || anyBulkUpdating}>
            Clear
          </button>

          {/* Bulk payment */}
          <select
            value={bulkPaymentStatus}
            onChange={(e) =>
              setBulkPaymentStatus(e.target.value as PaymentStatus)
            }
            className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-xs text-white disabled:opacity-60"
            disabled={anyBulkUpdating}
            style={{ colorScheme: "dark" }}>
            <option value="pending" className={DROPDOWN_OPTION_CLASS}>
              pending
            </option>
            <option value="paid" className={DROPDOWN_OPTION_CLASS}>
              paid
            </option>
            <option value="failed" className={DROPDOWN_OPTION_CLASS}>
              failed
            </option>
          </select>

          <button
            onClick={handleBulkUpdatePayment}
            className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-black hover:bg-gray-200 disabled:opacity-60"
            disabled={selectedCount === 0 || anyBulkUpdating}>
            {bulkPaymentUpdating ? "Applying..." : "Apply Payment"}
          </button>

          <div className="mx-2 h-6 w-px bg-white/10" />

          {/* Bulk status */}
          <select
            value={bulkOrderStatus}
            onChange={(e) => setBulkOrderStatus(e.target.value as OrderStatus)}
            className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-xs text-white disabled:opacity-60"
            disabled={anyBulkUpdating}
            style={{ colorScheme: "dark" }}>
            <option value="pending" className={DROPDOWN_OPTION_CLASS}>
              pending
            </option>
            <option value="confirmed" className={DROPDOWN_OPTION_CLASS}>
              confirmed
            </option>
            <option value="shipped" className={DROPDOWN_OPTION_CLASS}>
              shipped
            </option>
            <option value="delayed" className={DROPDOWN_OPTION_CLASS}>
              delayed
            </option>
            <option value="delivered" className={DROPDOWN_OPTION_CLASS}>
              delivered
            </option>
            <option value="failed" className={DROPDOWN_OPTION_CLASS}>
              failed
            </option>
          </select>

          <button
            onClick={handleBulkUpdateStatus}
            className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-black hover:bg-gray-200 disabled:opacity-60"
            disabled={selectedCount === 0 || anyBulkUpdating}>
            {bulkStatusUpdating ? "Applying..." : "Apply Status"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAllFiltered}
                  disabled={filtered.length === 0 || anyBulkUpdating}
                />
              </th>
              <th className="px-4 py-3 text-left">Order Code</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Payment Method</th>
              <th className="px-4 py-3 text-left">Payment</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                  Empty
                </td>
              </tr>
            ) : (
              filtered.map((o) => {
                const pay: PaymentStatus = o.paymentStatus ?? "pending";
                const paymentMethodLabel =
                  o.paymentMethod && PAYMENT_METHOD_LABEL[o.paymentMethod]
                    ? PAYMENT_METHOD_LABEL[o.paymentMethod]
                    : "-";
                const rowPayUpdating = updatingPaymentId === o._id;
                const rowStatusUpdating = updatingStatusId === o._id;

                return (
                  <tr
                    key={o._id}
                    className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(o._id)}
                        onChange={() => toggleOne(o._id)}
                        disabled={anyBulkUpdating}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/orders/${o._id}`}
                        className="font-medium text-white hover:underline">
                        {o.orderCode}
                      </Link>
                      {o.status === "failed" && o.failReason ? (
                        <div className="mt-1 text-xs text-red-300/80 line-clamp-1">
                          Reason: {o.failReason}
                        </div>
                      ) : null}
                    </td>

                    <td className="px-4 py-3 text-white">
                      {o.totalAmount?.toLocaleString()}₫
                    </td>

                    {/* ✅ Status: select dạng chip, dropdown 1 màu */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <select
                          value={o.status}
                          disabled={
                            anyBulkUpdating ||
                            rowStatusUpdating ||
                            o.status === "delivered"
                          }
                          onChange={(e) =>
                            handleUpdateStatus(
                              o._id,
                              e.target.value as OrderStatus,
                            )
                          }
                          className={`min-w-[110px] rounded-full border border-white/10 px-3 py-1 pr-7 text-xs outline-none ${ORDER_STATUS_STYLE[o.status]} disabled:opacity-60`}
                          title={
                            o.status === "delivered"
                              ? "Delivered không thể cập nhật"
                              : ""
                          }
                          style={{ colorScheme: "dark" }}>
                          <option
                            value="pending"
                            className={DROPDOWN_OPTION_CLASS}>
                            pending
                          </option>
                          <option
                            value="confirmed"
                            className={DROPDOWN_OPTION_CLASS}>
                            confirmed
                          </option>
                          <option
                            value="shipped"
                            className={DROPDOWN_OPTION_CLASS}>
                            shipped
                          </option>
                          <option
                            value="delayed"
                            className={DROPDOWN_OPTION_CLASS}>
                            delayed
                          </option>
                          <option
                            value="delivered"
                            className={DROPDOWN_OPTION_CLASS}>
                            delivered
                          </option>
                          <option
                            value="failed"
                            className={DROPDOWN_OPTION_CLASS}>
                            failed
                          </option>
                        </select>

                        {rowStatusUpdating ? (
                          <span className="text-xs text-white/50">
                            Saving...
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-white/80">
                      {paymentMethodLabel}
                    </td>

                    {/* ✅ Payment: select dạng chip, dropdown 1 màu */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <select
                          value={pay}
                          disabled={anyBulkUpdating || rowPayUpdating}
                          onChange={(e) =>
                            handleUpdatePayment(
                              o._id,
                              e.target.value as PaymentStatus,
                            )
                          }
                          className={`min-w-[110px] rounded-full border border-white/10 px-3 py-1 pr-7 text-xs outline-none ${PAYMENT_STATUS_STYLE[pay]} disabled:opacity-60`}
                          style={{ colorScheme: "dark" }}>
                          <option
                            value="pending"
                            className={DROPDOWN_OPTION_CLASS}>
                            pending
                          </option>
                          <option
                            value="paid"
                            className={DROPDOWN_OPTION_CLASS}>
                            paid
                          </option>
                          <option
                            value="failed"
                            className={DROPDOWN_OPTION_CLASS}>
                            failed
                          </option>
                        </select>

                        {rowPayUpdating ? (
                          <span className="text-xs text-white/50">
                            Saving...
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-white/70">
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleString()
                        : "-"}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/orders/${o._id}`}
                        className="text-blue-400 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
