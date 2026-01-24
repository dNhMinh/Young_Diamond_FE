import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createBannerApi,
  deleteBannerApi,
  getBannersApi,
  updateBannerApi,
  type Banner,
  type BannerType,
  type CreateBannerPayload,
} from "../../../api/admin/banners.api";
import BannerFormModal from "../../../components/admin/modals/BannerFormModal";

type TypeFilter = "all" | BannerType;

export default function AdminBannersPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [banners, setBanners] = useState<Banner[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<TypeFilter>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Banner | undefined>(undefined);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBannersApi();
      const list = (res.data.data ?? [])
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      setBanners(list);
    } catch (e) {
      console.error(e);
      setBanners([]);
      alert("Không lấy được danh sách banner.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBanners();
  }, [fetchBanners]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return banners.filter((b) => {
      if (type !== "all" && b.type !== type) return false;
      if (!q) return true;
      const s =
        `${b.type} ${b.altText ?? ""} ${b.linkUrl ?? ""} ${b.imageUrl ?? ""}`.toLowerCase();
      return s.includes(q);
    });
  }, [banners, search, type]);

  const openCreate = () => {
    setModalMode("create");
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (b: Banner) => {
    setModalMode("edit");
    setEditing(b);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(undefined);
    setModalMode("create");
  };

  const handleSubmit = async (payload: CreateBannerPayload) => {
    setSaving(true);
    try {
      if (modalMode === "create") {
        const ok = confirm(
          `Tạo banner type=${payload.type}, position=${payload.position}?`,
        );
        if (!ok) return;
        const res = await createBannerApi(payload);
        alert(res.data?.success ? "Created" : "Created");
      } else {
        if (!editing?._id) return alert("Thiếu bannerId");
        const ok = confirm(`Cập nhật banner ${editing._id}?`);
        if (!ok) return;
        await updateBannerApi(editing._id, payload);
        alert("Updated");
      }

      closeModal();
      await fetchBanners();
    } catch (e) {
      console.error(e);
      alert("Thao tác banner thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b: Banner) => {
    const ok = confirm(`Xóa banner ${b._id}?`);
    if (!ok) return;

    setSaving(true);
    try {
      const res = await deleteBannerApi(b._id);
      alert(res.data.message || "Deleted");
      if (modalOpen && editing?._id === b._id) closeModal();
      await fetchBanners();
    } catch (e) {
      console.error(e);
      alert("Xóa banner thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Banners</h2>

        <div className="flex gap-3">
          <button
            onClick={fetchBanners}
            disabled={loading || saving}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

          <button
            onClick={openCreate}
            disabled={saving}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-60"
          >
            + Add banner
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          className="w-72 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          placeholder="Search alt/link/type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value as TypeFilter)}
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white"
        >
          <option value="all">All types</option>
          <option value="homepage">homepage</option>
          <option value="sidebar">sidebar</option>
          <option value="slideshow">slideshow</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Preview</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Position</th>
              <th className="px-4 py-3 text-left">Active</th>
              <th className="px-4 py-3 text-left">Alt / Link</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-white/60"
                >
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-white/60"
                >
                  Empty
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr
                  key={b._id}
                  className="border-t border-white/5 hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    {b.imageUrl ? (
                      <img
                        src={b.imageUrl}
                        alt={b.altText ?? "banner"}
                        className="h-10 w-28 rounded bg-black/30 object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <span className="text-xs text-white/50">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-white">{b.type}</td>
                  <td className="px-4 py-3 text-white">{b.position}</td>

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

                  <td className="px-4 py-3 text-white">
                    <div className="text-xs text-white/70 line-clamp-1">
                      {b.altText ?? "-"}
                    </div>
                    <div className="text-xs text-white/50 line-clamp-1">
                      {b.linkUrl ?? "-"}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(b)}
                        disabled={saving}
                        className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white hover:bg-white/10 disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(b)}
                        disabled={saving}
                        className="rounded-lg border border-red-500/40 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen ? (
        <BannerFormModal
          key={`${modalMode}-${editing?._id ?? "new"}`}
          open={modalOpen}
          mode={modalMode}
          initialValues={editing}
          onClose={closeModal}
          onSubmit={handleSubmit}
          submitting={saving}
        />
      ) : null}
    </div>
  );
}
