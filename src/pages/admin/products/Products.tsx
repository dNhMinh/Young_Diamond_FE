//src/pages/admin/products/Products.tsx
import { useEffect, useMemo, useState } from "react";
import {
  createProductApi,
  getAdminProductsApi,
  getProductDetailApi,
  softDeleteProductApi,
  updateProductApi,
  type UpdateProductPayload,
} from "../../../api/admin/product.api";
import { Link } from "react-router-dom";
import ProductFormModal, {
  type ProductFormValues,
  type SizeItem,
  type VariantItem,
} from "../../../components/admin/modals/ProductFormModal";
import type { ProductListItem } from "../../../types/product";

type ProductStatusFilter = "all" | "active" | "inactive" | "out_of_stock";

/** ===== helpers: build diff payload (only changed fields) ===== */
const trim = (s: unknown) => (typeof s === "string" ? s.trim() : s);

const normalizeStringArray = (arr?: string[]) =>
  (arr ?? []).map((x) => String(x).trim()).filter(Boolean);

const normalizeSizeArray = (arr?: SizeItem[]) =>
  (arr ?? []).map((s) => ({
    freeSize: Boolean(s.freeSize),
    size: String(s.size ?? "").trim(),
    type: String(s.type ?? "").trim(),
  }));

const normalizeVariantArray = (arr?: VariantItem[]) =>
  (arr ?? []).map((v) => ({
    color: String(v.color ?? "").trim(),
    images: (v.images ?? []).map((x) => String(x).trim()).filter(Boolean),
    stock: Number(v.stock ?? 0),
  }));

const deepEqual = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

/**
 * Create diff payload between initial and current.
 * Return Partial payload compatible with backend update.
 */
// function buildProductDiff(
//   initial: ProductFormValues,
//   current: ProductFormValues,
// ): UpdateProductPayload {
//   const diff: UpdateProductPayload = {};

//   // primitive fields
//   if (trim(current.title) !== trim(initial.title)) diff.title = current.title;
//   if (trim(current.description) !== trim(initial.description))
//     diff.description = current.description;

//   if (Number(current.price) !== Number(initial.price))
//     diff.price = current.price;
//   if (Number(current.stock) !== Number(initial.stock))
//     diff.stock = current.stock;

//   // discount: treat as number, allow 0
//   if (Number(current.discount ?? 0) !== Number(initial.discount ?? 0))
//     diff.discount = current.discount ?? 0;

//   // status
//   if (current.status !== initial.status) diff.status = current.status;

//   // category
//   if (current.product_category_id !== initial.product_category_id)
//     diff.product_category_id = current.product_category_id;

//   // arrays
//   const curImages = normalizeStringArray(current.images);
//   const initImages = normalizeStringArray(initial.images);
//   if (!deepEqual(curImages, initImages)) diff.images = curImages;

//   const curColors = normalizeStringArray(current.color);
//   const initColors = normalizeStringArray(initial.color);
//   if (!deepEqual(curColors, initColors)) diff.color = curColors;

//   const curSize = normalizeSizeArray(current.size);
//   const initSize = normalizeSizeArray(initial.size);
//   if (!deepEqual(curSize, initSize)) diff.size = curSize;

//   return diff;
// }

function buildProductDiff(
  initial: ProductFormValues,
  current: ProductFormValues,
): UpdateProductPayload {
  const diff: UpdateProductPayload = {};

  if (trim(current.title) !== trim(initial.title)) diff.title = current.title;
  if (trim(current.description) !== trim(initial.description))
    diff.description = current.description;

  if (Number(current.price) !== Number(initial.price))
    diff.price = current.price;

  if (Number(current.position) !== Number(initial.position))
    diff.position = current.position;

  if (Boolean(current.isManageStock) !== Boolean(initial.isManageStock))
    diff.isManageStock = current.isManageStock;

  if (Number(current.discount ?? 0) !== Number(initial.discount ?? 0))
    diff.discount = current.discount ?? 0;

  if (current.status !== initial.status) diff.status = current.status;

  if (current.product_category_id !== initial.product_category_id)
    diff.product_category_id = current.product_category_id;

  if (trim(current.thumbnail) !== trim(initial.thumbnail))
    diff.thumbnail = current.thumbnail;

  const curSize = normalizeSizeArray(current.size);
  const initSize = normalizeSizeArray(initial.size);
  if (!deepEqual(curSize, initSize)) diff.size = curSize;

  const curVariant = normalizeVariantArray(current.variant);
  const initVariant = normalizeVariantArray(initial.variant);
  if (!deepEqual(curVariant, initVariant)) diff.variant = curVariant;

  return diff;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchKey, setSearchKey] = useState("");
  const [status, setStatus] = useState<ProductStatusFilter>("all");

  // modal (create/edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [submitting, setSubmitting] = useState(false);

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openingSlug, setOpeningSlug] = useState<string | null>(null);

  const [initialValues, setInitialValues] = useState<
    Partial<ProductFormValues> | undefined
  >(undefined);

  // store full initial (normalized) to compute diff
  const [initialEditValues, setInitialEditValues] =
    useState<ProductFormValues | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getAdminProductsApi({
        searchKey: searchKey || undefined,
        status: status === "all" ? undefined : status,
        deleted: false,
      });
      setProducts(res.data.data ?? []);
    } catch (error) {
      console.error("Fetch products failed", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey, status]);

  const handleSoftDelete = async (productId: string) => {
    const confirmDelete = confirm("Bạn có chắc muốn xóa tạm sản phẩm này?");
    if (!confirmDelete) return;

    try {
      await softDeleteProductApi(productId);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Xóa tạm sản phẩm thất bại");
    }
  };

  const openCreate = () => {
    setModalMode("create");
    setEditingId(null);
    setInitialValues(undefined);
    setInitialEditValues(null);
    setModalOpen(true);
  };

  const openEdit = async (slug: string) => {
    setOpeningSlug(slug);
    try {
      const res = await getProductDetailApi(slug);
      const p = res.data.data;

      // const mappedSize: SizeItem[] = (p.size ?? []).map((s) => ({
      //   freeSize: Boolean(s.freeSize),
      //   size: s.size ?? "",
      //   type: s.type ?? "",
      // }));

      // const full: ProductFormValues = {
      //   title: p.title ?? "",
      //   description: p.description ?? "",
      //   price: Number(p.price ?? 0),
      //   product_category_id: p.product_category_id ?? "",
      //   images: p.images ?? [],
      //   stock: Number(p.stock ?? 0),
      //   discount: Number(p.discount ?? 0),
      //   status: p.status,
      //   color: p.color ?? [],
      //   size: mappedSize.length
      //     ? mappedSize
      //     : [{ freeSize: false, size: "M", type: "standard" }],
      // };

      const mappedSize: SizeItem[] = (p.size ?? []).map((s) => ({
        freeSize: Boolean(s.freeSize),
        size: s.size ?? "",
        type: s.type ?? "",
      }));

      const mappedVariant: VariantItem[] = (p.variant ?? []).map((v) => ({
        color: v.color ?? "",
        images: v.images ?? [],
        stock: Number(v.stock ?? 0),
      }));

      const full: ProductFormValues = {
        title: p.title ?? "",
        description: p.description ?? "",
        price: Number(p.price ?? 0),
        product_category_id: p.product_category_id ?? "",
        thumbnail: p.thumbnail ?? "",
        position: Number(p.position ?? 0),
        isManageStock: Boolean(p.isManageStock),
        discount: Number(p.discount ?? 0),
        status: p.status,
        size: mappedSize.length
          ? mappedSize
          : [{ freeSize: false, size: "M", type: "standard" }],
        variant: mappedVariant.length
          ? mappedVariant
          : [{ color: "", images: [], stock: 0 }],
      };

      setEditingId(p._id);
      setInitialValues(full);
      setInitialEditValues(full);

      setModalMode("edit");
      setModalOpen(true);
    } catch (e) {
      console.error(e);
      alert("Không lấy được dữ liệu sản phẩm để sửa");
    } finally {
      setOpeningSlug(null);
    }
  };

  const handleSubmit = async (values: ProductFormValues) => {
    setSubmitting(true);
    try {
      if (modalMode === "create") {
        const res = await createProductApi(values);
        alert(res.data.message || "Tạo sản phẩm thành công");
      } else {
        if (!editingId) {
          alert("Thiếu product_id để cập nhật");
          return;
        }
        if (!initialEditValues) {
          alert("Thiếu dữ liệu ban đầu để so sánh (diff)");
          return;
        }

        const diff = buildProductDiff(initialEditValues, values);

        // nếu không đổi gì thì khỏi gọi API
        if (Object.keys(diff).length === 0) {
          alert("Không có thay đổi nào để cập nhật");
          setModalOpen(false);
          return;
        }

        const res = await updateProductApi(editingId, diff);
        alert(res.data.message || "Cập nhật sản phẩm thành công");
      }

      setModalOpen(false);
      fetchProducts();
    } catch (e) {
      console.error(e);
      alert(
        modalMode === "create"
          ? "Tạo sản phẩm thất bại"
          : "Cập nhật sản phẩm thất bại",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isRowOpening = useMemo(
    () => (slug: string) => openingSlug === slug,
    [openingSlug],
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Products</h2>

        <div className="flex gap-3">
          <Link
            to="/admin/products/trash"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10">
            Trash
          </Link>

          <button
            onClick={openCreate}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200">
            Add Product
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          className="w-64 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          placeholder="Search product..."
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ProductStatusFilter)}
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white">
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Position</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product._id}
                  className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <Link to={`/admin/products/${product.slug}`}>
                      <img
                        src={product.thumbnail || product.image || ""}
                        alt={product.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                    </Link>
                  </td>

                  <td className="px-4 py-3 text-white">{product.title}</td>

                  <td className="px-4 py-3 text-white">
                    {product.price.toLocaleString()}₫
                  </td>

                  <td className="px-4 py-3 text-white">
                    {product.position ?? "-"}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={product.status} />
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(product.slug)}
                      disabled={isRowOpening(product.slug)}
                      className="mr-3 text-blue-400 hover:underline disabled:opacity-60">
                      {isRowOpening(product.slug) ? "Loading..." : "Edit"}
                    </button>

                    <button
                      onClick={() => handleSoftDelete(product._id)}
                      className="text-red-400 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProductFormModal
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-green-500/20 text-green-400",
    inactive: "bg-yellow-500/20 text-yellow-400",
    out_of_stock: "bg-red-500/20 text-red-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs ${
        map[status] ?? "bg-gray-500/20 text-gray-400"
      }`}>
      {status}
    </span>
  );
}
