//src/pages/admin/agent-requests/AgentRequestsPage.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getAdminAgentRequestsApi,
  getBusinessFormsApi,
  type AgentRequest,
} from "../../../api/admin/agentRequests.api";

type FetchStatus = "loading" | "success" | "error";

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

  // chống race condition (bấm refresh nhiều lần)
  const reqIdRef = useRef(0);

  const load = useCallback(async (opts?: { showLoading?: boolean }) => {
    const showLoading = opts?.showLoading ?? true;
    const reqId = ++reqIdRef.current;

    // ✅ chỉ show loading khi user refresh
    if (showLoading) setStatus("loading");

    try {
      const [reqRes, formRes] = await Promise.all([
        getAdminAgentRequestsApi(),
        getBusinessFormsApi(),
      ]);

      // bỏ qua kết quả cũ nếu có request mới hơn
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

  // ✅ Mount: defer load ra khỏi effect để tránh warning "setState synchronously..."
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

  const total = useMemo(() => items.length, [items]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Agent Requests</h2>
          <p className="mt-1 text-sm text-gray-400">Total: {total}</p>
        </div>

        <button
          onClick={() => void load({ showLoading: true })}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/10">
          Refresh
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
                <th className="px-4 py-3 text-left">Created</th>
              </tr>
            </thead>

            <tbody>
              {items.length ? (
                items.map((x) => {
                  const formId = x.bussinessForm;
                  const form = formId ? forms[formId] : undefined;

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

                      {/* <td className="px-4 py-3">
                        {x.linkShop ? (
                          <a
                            href={x.linkShop}
                            target="_blank"
                            rel="noreferrer"
                            className="text-white hover:underline">
                            Open
                          </a>
                        ) : (
                          <span className="text-white/40">-</span>
                        )}
                      </td> */}
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

                      <td className="px-4 py-3 text-white/80">
                        {fmtDate(x.createdAt)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-400">
                    No agent requests
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
