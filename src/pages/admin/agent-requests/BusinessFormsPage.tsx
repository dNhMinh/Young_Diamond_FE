import { useEffect, useMemo, useState } from "react";
import {
  createBusinessFormApi,
  deleteBusinessFormApi,
  getBusinessFormsApi,
  updateBusinessFormApi,
  type BusinessForm,
  type CreateBusinessFormPayload,
} from "../../../api/admin/agentRequests.api";
import BusinessFormModal from "../../../components/admin/modals/BusinessFormModal";

type FetchStatus = "loading" | "success" | "error";

function fmtDate(v?: string) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

export default function BusinessFormsPage() {
  const [items, setItems] = useState<BusinessForm[]>([]);
  const [status, setStatus] = useState<FetchStatus>("loading");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<BusinessForm | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setStatus("loading");
    try {
      const res = await getBusinessFormsApi();
      setItems(res.data.data ?? []);
      setStatus("success");
    } catch (e) {
      console.error(e);
      setItems([]);
      setStatus("error");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setMode("create");
    setEditing(undefined);
    setOpen(true);
  };

  const openEdit = (x: BusinessForm) => {
    setMode("edit");
    setEditing(x);
    setOpen(true);
  };

  const onClose = () => setOpen(false);

  const submit = async (payload: CreateBusinessFormPayload) => {
    setSubmitting(true);
    try {
      if (mode === "create") {
        await createBusinessFormApi(payload);
      } else {
        if (!editing?._id) return;
        await updateBusinessFormApi(editing._id, payload);
      }
      setOpen(false);
      await load();
    } catch (e) {
      console.error(e);
      alert(
        "Thao tác thất bại. Vui lòng kiểm tra lại API hoặc quyền truy cập.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    const ok = window.confirm("Xóa hình thức kinh doanh này?");
    if (!ok) return;

    try {
      await deleteBusinessFormApi(id);
      await load();
    } catch (e) {
      console.error(e);
      alert("Xóa thất bại.");
    }
  };

  const total = useMemo(() => items.length, [items]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Business Forms</h2>
          <p className="mt-1 text-sm text-gray-400">Total: {total}</p>
        </div>

        <button
          onClick={openCreate}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200"
        >
          + Add
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
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-center">Active</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-left">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.length ? (
                items.map((x) => (
                  <tr
                    key={x._id}
                    className="border-t border-white/5 hover:bg-white/5"
                  >
                    <td className="px-4 py-3 text-white">
                      <div className="flex flex-col">
                        <span className="font-medium">{x.name}</span>
                        <span className="text-xs text-white/50">{x._id}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                          x.isActive
                            ? "bg-green-500/15 text-green-300"
                            : "bg-red-500/15 text-red-300"
                        }`}
                      >
                        {x.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-white/80">
                      {fmtDate(x.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-white/80">
                      {fmtDate(x.updatedAt)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(x)}
                          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white hover:bg-white/10"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(x._id)}
                          className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    No business forms
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <BusinessFormModal
        open={open}
        mode={mode}
        initialValues={editing}
        onClose={onClose}
        onSubmit={submit}
        submitting={submitting}
      />
    </div>
  );
}
