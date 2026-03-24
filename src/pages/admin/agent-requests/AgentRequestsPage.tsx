import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  deleteAgentRequestApi,
  getAdminAgentRequestsApi,
  getBusinessFormsApi,
  updateAgentRequestIsContactedApi,
  type AgentRequest,
} from "../../../api/admin/agentRequests.api";

type FetchStatus = "loading" | "success" | "error";
type ViewMode = "active" | "trash";

function fmtDate(v?: string) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

function normalizeExternalUrl(v?: string) {
  const raw = (v ?? "").trim();
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) return raw;

  return `https://${raw}`;
}

type FormIndex = Record<string, { name: string; isActive: boolean }>;

export default function AgentRequestsPage() {
  const [items, setItems] = useState<AgentRequest[]>([]);
  const [forms, setForms] = useState<FormIndex>({});
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [viewMode, setViewMode] = useState<ViewMode>("active");

  const [updatingContactId, setUpdatingContactId] = useState<string | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // chống race condition (bấm refresh nhiều lần)
  const reqIdRef = useRef(0);

  const load = useCallback(async (opts?: { showLoading?: boolean }) => {
    const showLoading = opts?.showLoading ?? true;
    const reqId = ++reqIdRef.current;

    if (showLoading) setStatus("loading");

    try {
      const [reqRes, formRes] = await Promise.all([
        getAdminAgentRequestsApi(),
        getBusinessFormsApi(),
      ]);

      if (reqIdRef.current !== reqId) return;

      const reqs = reqRes.data.data ?? [];
      const formList = formRes.data.data ?? [];

      const idx: FormIndex = {};
      for (const f of formList) {
        idx[f._id] = { name: f.name, isActive: !!f.isActive };
      }

      setItems(reqs);
      setForms(idx);
      setStatus("success");
    } catch (e) {
      if (reqIdRef.current !== reqId) return;

      console.error(e);
      setItems([]);
      setForms({});
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    let alive = true;

    const t = window.setTimeout(() => {
      if (!alive) return;
      void load({ showLoading: false });
    }, 0);

    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [load]);

  const activeItems = useMemo(() => items.filter((x) => !x.deleted), [items]);

  const trashItems = useMemo(() => items.filter((x) => !!x.deleted), [items]);

  const visibleItems = useMemo(() => {
    return viewMode === "trash" ? trashItems : activeItems;
  }, [viewMode, activeItems, trashItems]);

  const total = useMemo(() => activeItems.length, [activeItems]);
  const trashTotal = useMemo(() => trashItems.length, [trashItems]);

  const handleMarkContacted = async (agentRequestId: string) => {
    const row = items.find((x) => x._id === agentRequestId);
    if (!row) return;

    if (row.isContacted) {
      alert("Yêu cầu này đã được đánh dấu liên hệ.");
      return;
    }

    const ok = confirm("Đánh dấu yêu cầu này là đã liên hệ?");
    if (!ok) return;

    setUpdatingContactId(agentRequestId);

    // optimistic update
    setItems((prev) =>
      prev.map((x) =>
        x._id === agentRequestId ? { ...x, isContacted: true } : x,
      ),
    );

    try {
      const res = await updateAgentRequestIsContactedApi(agentRequestId);
      alert(res.data.message || "Cập nhật thành công");
    } catch (e) {
      console.error(e);
      alert("Cập nhật trạng thái liên hệ thất bại.");

      // revert
      setItems((prev) =>
        prev.map((x) =>
          x._id === agentRequestId
            ? { ...x, isContacted: row.isContacted ?? false }
            : x,
        ),
      );
    } finally {
      setUpdatingContactId(null);
    }
  };

  const handleDelete = async (agentRequestId: string) => {
    const row = items.find((x) => x._id === agentRequestId);
    if (!row) return;

    const ok = confirm("Bạn có chắc muốn chuyển yêu cầu này vào thùng rác?");
    if (!ok) return;

    setDeletingId(agentRequestId);

    // optimistic update
    setItems((prev) =>
      prev.map((x) => (x._id === agentRequestId ? { ...x, deleted: true } : x)),
    );

    try {
      const res = await deleteAgentRequestApi(agentRequestId);
      alert(res.data.message || "Xóa thành công");
    } catch (e) {
      console.error(e);
      alert("Xóa yêu cầu thất bại.");

      // revert
      setItems((prev) =>
        prev.map((x) =>
          x._id === agentRequestId
            ? { ...x, deleted: row.deleted ?? false }
            : x,
        ),
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Agent Requests</h2>
          <p className="mt-1 text-sm text-gray-400">
            Total: {total} • Trash: {trashTotal}
          </p>
        </div>

        <button
          onClick={() => void load({ showLoading: true })}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/10">
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setViewMode("active")}
          className={[
            "rounded-lg px-4 py-2 text-sm font-medium transition",
            viewMode === "active"
              ? "bg-white text-black"
              : "border border-white/15 text-white hover:bg-white/10",
          ].join(" ")}>
          Danh sách yêu cầu
        </button>

        <button
          type="button"
          onClick={() => setViewMode("trash")}
          className={[
            "rounded-lg px-4 py-2 text-sm font-medium transition",
            viewMode === "trash"
              ? "bg-white text-black"
              : "border border-white/15 text-white hover:bg-white/10",
          ].join(" ")}>
          Thùng rác
          {trashTotal > 0 ? (
            <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              {trashTotal}
            </span>
          ) : null}
        </button>
      </div>

      {status === "loading" ? (
        <div className="text-gray-300">Loading...</div>
      ) : status === "error" ? (
        <div className="text-gray-300">Load failed</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Business form</th>
                <th className="px-4 py-3 text-left">Address</th>
                <th className="px-4 py-3 text-left">Link shop</th>
                <th className="px-4 py-3 text-left">Liên hệ</th>
                <th className="px-4 py-3 text-left">Created</th>
                {viewMode === "active" ? (
                  <th className="px-4 py-3 text-right">Actions</th>
                ) : null}
              </tr>
            </thead>

            <tbody>
              {visibleItems.length ? (
                visibleItems.map((x) => {
                  const formId = x.bussinessForm;
                  const form = formId ? forms[formId] : undefined;
                  const rowUpdatingContact = updatingContactId === x._id;
                  const rowDeleting = deletingId === x._id;

                  return (
                    <tr
                      key={x._id}
                      className="border-t border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">
                            {x.fullName}
                          </span>
                          <span className="text-xs text-white/70">
                            {x.phoneNumber} • {x.email}
                          </span>
                          <span className="text-xs text-white/40">{x._id}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {form ? (
                          <div className="flex flex-col">
                            <span className="text-white">{form.name}</span>
                            <span
                              className={`text-xs ${
                                form.isActive
                                  ? "text-green-300"
                                  : "text-red-300"
                              }`}>
                              {form.isActive ? "Active" : "Inactive"}
                            </span>
                            <span className="text-xs text-white/40">
                              {formId}
                            </span>
                          </div>
                        ) : (
                          <span className="text-white/70">
                            {formId ? `Unknown (${formId})` : "-"}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-white/80">
                        {x.address || "-"}
                        {x.description ? (
                          <div className="mt-1 text-xs text-white/50 line-clamp-2">
                            {x.description}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-4 py-3">
                        {x.linkShop ? (
                          <a
                            href={normalizeExternalUrl(x.linkShop)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-white hover:underline">
                            Open
                          </a>
                        ) : (
                          <span className="text-white/40">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {x.isContacted ? (
                          <span className="inline-flex items-center rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-300">
                            ✓ Đã liên hệ
                          </span>
                        ) : viewMode === "active" ? (
                          <button
                            type="button"
                            onClick={() => void handleMarkContacted(x._id)}
                            disabled={rowUpdatingContact}
                            className="inline-flex items-center rounded-full border border-yellow-400/30 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-300 hover:bg-yellow-500/15 disabled:opacity-60">
                            {rowUpdatingContact
                              ? "Đang cập nhật..."
                              : "Đánh dấu đã liên hệ"}
                          </button>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
                            Chưa liên hệ
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-white/80">
                        {fmtDate(x.createdAt)}
                      </td>

                      {viewMode === "active" ? (
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => void handleDelete(x._id)}
                            disabled={rowDeleting}
                            className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-60">
                            {rowDeleting ? "Đang xóa..." : "Xóa tạm"}
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={viewMode === "active" ? 7 : 6}
                    className="px-4 py-6 text-center text-gray-400">
                    {viewMode === "trash"
                      ? "Thùng rác đang trống"
                      : "No agent requests"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
