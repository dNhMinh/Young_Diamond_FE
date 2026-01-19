// src/pages/admin/ProductCategories.tsx
import { useEffect, useMemo, useState } from "react";
import {
  createProductCategoryApi,
  getAdminProductCategoriesApi,
  getProductCategoryDetailApi,
  softDeleteProductCategoryApi,
  updateProductCategoryApi,
  type ProductCategoryListItem,
  type ProductCategoryStatus,
  type UpdateProductCategoryPayload,
} from "../../api/admin/productCategory.api";
import { Link } from "react-router-dom";
import ProductCategoryFormModal, {
  type ProductCategoryFormValues,
} from "../../components/admin/ProductCategoryFormModal";

type StatusFilter = "all" | ProductCategoryStatus;

/** ===== helpers: build diff payload (only changed fields) ===== */
const trim = (s: unknown) => (typeof s === "string" ? s.trim() : s);

function buildCategoryDiff(
  initial: ProductCategoryFormValues,
  current: ProductCategoryFormValues,
): UpdateProductCategoryPayload {
  const diff: UpdateProductCategoryPayload = {};

  if (trim(current.title) !== trim(initial.title)) diff.title = current.title;

  // normalize undefined/null => "" for compare safety
  const initDesc = trim(initial.description ?? "");
  const curDesc = trim(current.description ?? "");
  if (curDesc !== initDesc) diff.description = current.description ?? "";

  if (current.status !== initial.status) diff.status = current.status;

  return diff;
}

export default function AdminProductCategories() {
  const [categories, setCategories] = useState<ProductCategoryListItem[]>([]);
  const [loading, setLoading] = useState(false);

  // optional: search UI (lọc local vì API không có searchKey)
  const [searchKey, setSearchKey] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  // modal (create/edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [submitting, setSubmitting] = useState(false);

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openingSlug, setOpeningSlug] = useState<string | null>(null);

  const [initialValues, setInitialValues] = useState<
    Partial<ProductCategoryFormValues> | undefined
  >(undefined);

  // store full initial to compute diff
  const [initialEditValues, setInitialEditValues] =
    useState<ProductCategoryFormValues | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getAdminProductCategoriesApi({
        status: status === "all" ? undefined : status,
        deleted: false,
      });
      setCategories(res.data.data ?? []);
    } catch (e) {
      console.error("Fetch categories failed", e);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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

  const openCreate = () => {
    setModalMode("create");
    setEditingId(null);
    setInitialValues(undefined);
    setInitialEditValues(null);
    setModalOpen(true);
  };

  const openEdit = async (slug?: string) => {
    if (!slug) return alert("Category thiếu slug");
    setOpeningSlug(slug);

    try {
      const res = await getProductCategoryDetailApi(slug);
      const c = res.data.data;

      const full: ProductCategoryFormValues = {
        title: c.title ?? "",
        description: c.description ?? "",
        status: (c.status ?? "inactive") as ProductCategoryStatus,
      };

      setEditingId(c._id);
      setInitialValues(full);
      setInitialEditValues(full);

      setModalMode("edit");
      setModalOpen(true);
    } catch (e) {
      console.error(e);
      alert("Không lấy được dữ liệu danh mục để sửa");
    } finally {
      setOpeningSlug(null);
    }
  };

  const handleSoftDelete = async (id: string) => {
    const ok = confirm("Bạn có chắc muốn xóa tạm danh mục này?");
    if (!ok) return;

    try {
      await softDeleteProductCategoryApi(id);
      fetchCategories();
    } catch (e) {
      console.error(e);
      alert("Xóa tạm thất bại");
    }
  };

  const handleSubmit = async (values: ProductCategoryFormValues) => {
    setSubmitting(true);
    try {
      if (modalMode === "create") {
        const res = await createProductCategoryApi(values);
        alert(res.data.message || "Tạo danh mục thành công");
      } else {
        if (!editingId) return alert("Thiếu id để cập nhật");
        if (!initialEditValues)
          return alert("Thiếu dữ liệu ban đầu để so sánh (diff)");

        const diff = buildCategoryDiff(initialEditValues, values);

        if (Object.keys(diff).length === 0) {
          alert("Không có thay đổi nào để cập nhật");
          setModalOpen(false);
          return;
        }

        const res = await updateProductCategoryApi(editingId, diff);
        alert(res.data.message || "Cập nhật danh mục thành công");
      }

      setModalOpen(false);
      fetchCategories();
    } catch (e) {
      console.error(e);
      alert(
        modalMode === "create" ? "Tạo danh mục thất bại" : "Cập nhật thất bại",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isRowOpening = useMemo(
    () => (slug?: string) => (slug ? openingSlug === slug : false),
    [openingSlug],
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Product Categories</h2>

        <div className="flex gap-3">
          <Link
            to="/admin/categories/trash"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            Trash
          </Link>

          <button
            onClick={openCreate}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200"
          >
            Add Category
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          className="w-64 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          placeholder="Search category..."
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
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No categories found
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c._id}
                  className="border-t border-white/5 hover:bg-white/5"
                >
                  {/* ✅ Title: click để xem chi tiết */}
                  <td className="px-4 py-3">
                    {c.slug ? (
                      <Link
                        to={`/admin/categories/${c.slug}`}
                        className="font-medium text-white hover:underline"
                      >
                        {c.title}
                      </Link>
                    ) : (
                      <span className="text-white">{c.title}</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-white">
                    {c.description || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <CategoryStatusBadge
                      status={(c.status ?? "inactive") as ProductCategoryStatus}
                    />
                  </td>

                  {/* ✅ Slug: click để xem chi tiết */}
                  <td className="px-4 py-3">
                    {c.slug ? (
                      <Link
                        to={`/admin/categories/${c.slug}`}
                        className="text-white/80 hover:underline"
                      >
                        {c.slug}
                      </Link>
                    ) : (
                      <span className="text-white/60">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(c.slug)}
                      disabled={isRowOpening(c.slug)}
                      className="mr-3 text-blue-400 hover:underline disabled:opacity-60"
                    >
                      {isRowOpening(c.slug) ? "Loading..." : "Edit"}
                    </button>

                    <button
                      onClick={() => handleSoftDelete(c._id)}
                      className="text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProductCategoryFormModal
        open={modalOpen}
        mode={modalMode}
        initialValues={initialValues}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}

function CategoryStatusBadge({ status }: { status: ProductCategoryStatus }) {
  const map: Record<ProductCategoryStatus, string> = {
    active: "bg-green-500/20 text-green-400",
    inactive: "bg-yellow-500/20 text-yellow-400",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs ${map[status]}`}>
      {status}
    </span>
  );
}
