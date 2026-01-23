// src/pages/admin/TrashProductCategories.tsx
import { useEffect, useMemo, useState } from "react";
import {
  getAdminProductCategoriesApi,
  restoreProductCategoryApi,
  hardDeleteProductCategoryApi,
  type ProductCategoryListItem,
  type ProductCategoryStatus,
} from "../../../api/admin/productCategory.api";
import { Link } from "react-router-dom";

type StatusFilter = "all" | ProductCategoryStatus;

export default function TrashProductCategories() {
  const [categories, setCategories] = useState<ProductCategoryListItem[]>([]);
  const [loading, setLoading] = useState(false);

  // giống TrashProducts (nhưng search lọc local)
  const [searchKey, setSearchKey] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const fetchTrashCategories = async () => {
    setLoading(true);
    try {
      const res = await getAdminProductCategoriesApi({
        deleted: true,
        status: status === "all" ? undefined : status,
      });
      setCategories(res.data.data ?? []);
    } catch (error) {
      console.error("Fetch trash categories failed", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => {
    const q = searchKey.trim().toLowerCase();
    if (!q) return categories;

    return categories.filter((c) => {
      const title = (c.title ?? "").toLowerCase();
      const slug = (c.slug ?? "").toLowerCase();
      const desc = (c.description ?? "").toLowerCase();
      return title.includes(q) || slug.includes(q) || desc.includes(q);
    });
  }, [categories, searchKey]);

  const handleRestore = async (id: string) => {
    const ok = confirm("Bạn có chắc muốn khôi phục danh mục này?");
    if (!ok) return;

    try {
      await restoreProductCategoryApi(id);
      fetchTrashCategories();
    } catch (error) {
      console.error("Restore failed", error);
      alert("Khôi phục danh mục thất bại");
    }
  };

  const handleHardDelete = async (id: string) => {
    const ok = confirm(
      "XÓA VĨNH VIỄN danh mục này? Hành động này không thể khôi phục.",
    );
    if (!ok) return;

    try {
      await hardDeleteProductCategoryApi(id);
      fetchTrashCategories();
    } catch (error) {
      console.error("Hard delete failed", error);
      alert("Xóa vĩnh viễn danh mục thất bại");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Trash Categories</h2>

        <Link
          to="/admin/categories"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
        >
          ← Back to Categories
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          className="w-64 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          placeholder="Search deleted category..."
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  Trash is empty
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c._id}
                  className="border-t border-white/5 hover:bg-white/5"
                >
                  <td className="px-4 py-3 text-white">{c.title}</td>

                  <td className="px-4 py-3 text-white/80">{c.slug ?? "-"}</td>

                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-500/20 px-3 py-1 text-xs text-gray-300">
                      Deleted
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => handleRestore(c._id)}
                        className="text-green-400 hover:underline"
                      >
                        Restore
                      </button>

                      <button
                        onClick={() => handleHardDelete(c._id)}
                        className="text-red-400 hover:underline"
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
    </div>
  );
}
