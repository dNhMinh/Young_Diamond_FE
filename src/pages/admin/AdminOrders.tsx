import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAdminOrdersApi,
  updateOrderPaymentStatusApi,
  updateMultiOrderPaymentStatusApi,
} from "../../api/admin/order.api";
import type {
  OrderListItem,
  OrderStatus,
  PaymentStatus,
} from "../../types/order";

type StatusFilter = "all" | OrderStatus;

export default function AdminOrders() {
  const [items, setItems] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState<StatusFilter>("all");
  const [searchKey, setSearchKey] = useState("");

  // update payment từng dòng
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ✅ chọn nhiều
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkPaymentStatus, setBulkPaymentStatus] =
    useState<PaymentStatus>("paid");
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getAdminOrdersApi({ status });
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
  }, [status]);

  const filtered = useMemo(() => {
    const q = searchKey.trim().toLowerCase();
    if (!q) return items;
    return items.filter((o) => (o.orderCode ?? "").toLowerCase().includes(q));
  }, [items, searchKey]);

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
        // bỏ chọn tất cả trong filtered
        filtered.forEach((o) => next.delete(o._id));
      } else {
        // chọn tất cả trong filtered
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

    setUpdatingId(orderId);

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
      setUpdatingId(null);
    }
  };

  // ✅ bulk update
  const handleBulkUpdatePayment = async () => {
    if (selectedInFiltered.length === 0) return alert("Bạn chưa chọn đơn nào.");

    const ok = confirm(
      `Cập nhật paymentStatus = "${bulkPaymentStatus}" cho ${selectedInFiltered.length} đơn hàng?`,
    );
    if (!ok) return;

    setBulkUpdating(true);

    // lưu status cũ để revert nếu fail
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
      setBulkUpdating(false);
    }
  };

  return (
    <div>
      {/* Header */}
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
        >
          <option value="all">All</option>
          <option value="pending">pending</option>
          <option value="confirmed">confirmed</option>
          <option value="shipped">shipped</option>
          <option value="delayed">delayed</option>
          <option value="delivered">delivered</option>
          <option value="failed">failed</option>
        </select>
      </div>

      {/* ✅ Bulk actions */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="text-sm text-gray-300">
          Selected (in current list):{" "}
          <span className="font-semibold text-white">{selectedCount}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={toggleSelectAllFiltered}
            className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white hover:bg-white/10 disabled:opacity-60"
            disabled={filtered.length === 0 || bulkUpdating}
          >
            {allFilteredSelected ? "Unselect All" : "Select All"}
          </button>

          <button
            onClick={clearSelected}
            className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white hover:bg-white/10 disabled:opacity-60"
            disabled={selectedCount === 0 || bulkUpdating}
          >
            Clear
          </button>

          <select
            value={bulkPaymentStatus}
            onChange={(e) =>
              setBulkPaymentStatus(e.target.value as PaymentStatus)
            }
            className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-xs text-white disabled:opacity-60"
            disabled={bulkUpdating}
          >
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="failed">failed</option>
          </select>

          <button
            onClick={handleBulkUpdatePayment}
            className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-black hover:bg-gray-200 disabled:opacity-60"
            disabled={selectedCount === 0 || bulkUpdating}
          >
            {bulkUpdating ? "Applying..." : "Apply to Selected"}
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
                  disabled={filtered.length === 0 || bulkUpdating}
                />
              </th>
              <th className="px-4 py-3 text-left">Order Code</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Payment</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  Empty
                </td>
              </tr>
            ) : (
              filtered.map((o) => {
                const pay: PaymentStatus = o.paymentStatus ?? "pending";
                const rowUpdating = updatingId === o._id;

                return (
                  <tr
                    key={o._id}
                    className="border-t border-white/5 hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(o._id)}
                        onChange={() => toggleOne(o._id)}
                        disabled={bulkUpdating}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/orders/${o._id}`}
                        className="font-medium text-white hover:underline"
                      >
                        {o.orderCode}
                      </Link>
                      {o.failReason ? (
                        <div className="mt-1 text-xs text-red-300/80 line-clamp-1">
                          Reason: {o.failReason}
                        </div>
                      ) : null}
                    </td>

                    <td className="px-4 py-3 text-white">
                      {o.totalAmount?.toLocaleString()}₫
                    </td>

                    <td className="px-4 py-3">
                      <OrderStatusBadge status={o.status} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <PaymentStatusBadge status={pay} />

                        {/* update từng dòng */}
                        <select
                          value={pay}
                          disabled={rowUpdating || bulkUpdating}
                          onChange={(e) =>
                            handleUpdatePayment(
                              o._id,
                              e.target.value as PaymentStatus,
                            )
                          }
                          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-2 py-1 text-xs text-white disabled:opacity-60"
                        >
                          <option value="pending">pending</option>
                          <option value="paid">paid</option>
                          <option value="failed">failed</option>
                        </select>

                        {rowUpdating ? (
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
                        className="text-blue-400 hover:underline"
                      >
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

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    confirmed: "bg-blue-500/20 text-blue-400",
    shipped: "bg-purple-500/20 text-purple-400",
    delayed: "bg-orange-500/20 text-orange-400",
    delivered: "bg-green-500/20 text-green-400",
    failed: "bg-red-500/20 text-red-400",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs ${map[status]}`}>
      {status}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, string> = {
    pending: "bg-gray-500/20 text-gray-300",
    paid: "bg-green-500/20 text-green-400",
    failed: "bg-red-500/20 text-red-400",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs ${map[status]}`}>
      {status}
    </span>
  );
}
