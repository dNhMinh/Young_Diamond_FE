import { useEffect, useMemo, useState } from "react";
import AdminModal from "./AdminModal";
import { uploadToCloudinary } from "../../../utils/cloudinary";
import {
  getAdminProductCategoriesApi,
  type ProductCategoryListItem,
} from "../../../api/admin/productCategory.api";

export type ProductStatus = "active" | "inactive" | "out_of_stock";

export type SizeItem = {
  freeSize: boolean;
  size: string;
  type: string;
};

export type ProductFormValues = {
  title: string;
  description: string;
  price: number;
  product_category_id: string;
  images: string[];
  stock: number;
  discount: number;
  status: ProductStatus;
  color: string[];
  size: SizeItem[];
};

type NumberInput = number | "";

type ProductDraft = Omit<
  ProductFormValues,
  "images" | "color" | "price" | "stock" | "discount"
> & {
  price: NumberInput;
  stock: NumberInput;
  discount: NumberInput;
};

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: Partial<ProductFormValues>;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  submitting?: boolean;
};

const emptyDraft: ProductDraft = {
  title: "",
  description: "",
  price: "",
  product_category_id: "",
  stock: "",
  discount: "",
  status: "active",
  size: [{ freeSize: false, size: "M", type: "standard" }],
};

function parseLinesOrComma(input: string) {
  return input
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseComma(input: string) {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toNumberInput(v: string): number | "" {
  if (v.trim() === "") return "";
  const n = Number(v);
  return Number.isFinite(n) ? n : "";
}

function toNumberOrZero(v: number | ""): number {
  return v === "" ? 0 : v;
}

export default function ProductFormModal({
  open,
  mode,
  initialValues,
  onClose,
  onSubmit,
  submitting = false,
}: Props) {
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);

  // text source of truth
  const [imagesText, setImagesText] = useState("");
  const [colorsText, setColorsText] = useState("");

  // upload
  const [uploading, setUploading] = useState(false);

  // categories
  const [categories, setCategories] = useState<ProductCategoryListItem[]>([]);
  const [catLoading, setCatLoading] = useState(false);

  const parsedImages = useMemo(
    () => parseLinesOrComma(imagesText),
    [imagesText],
  );

  const parsedColors = useMemo(() => parseComma(colorsText), [colorsText]);

  // reset khi mở modal
  useEffect(() => {
    if (!open) return;

    const merged: ProductDraft = {
      ...emptyDraft,
      ...initialValues,
      price:
        initialValues?.price === undefined || initialValues?.price === null
          ? ""
          : initialValues.price,
      stock:
        initialValues?.stock === undefined || initialValues?.stock === null
          ? ""
          : initialValues.stock,
      discount:
        initialValues?.discount === undefined ||
        initialValues?.discount === null
          ? ""
          : initialValues.discount,
      size: (initialValues?.size as SizeItem[]) ?? emptyDraft.size,
    };

    setDraft(merged);
    setImagesText((initialValues?.images ?? []).join("\n"));
    setColorsText((initialValues?.color ?? []).join(", "));
  }, [open, initialValues]);

  // load categories khi mở modal
  useEffect(() => {
    if (!open) return;

    (async () => {
      setCatLoading(true);
      try {
        const res = await getAdminProductCategoriesApi({
          status: "active",
          deleted: false,
        });
        const list = res.data.data ?? [];
        setCategories(list);

        // auto-select category đầu tiên nếu đang trống (create)
        if (mode === "create" && !draft.product_category_id && list[0]?._id) {
          setDraft((p) => ({ ...p, product_category_id: list[0]._id }));
        }
      } catch {
        setCategories([]);
      } finally {
        setCatLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const fileArr = Array.from(files);

      // upload tuần tự cho chắc (đỡ rate-limit)
      const uploadedUrls: string[] = [];
      for (const f of fileArr) {
        const res = await uploadToCloudinary(f);
        uploadedUrls.push(res.secure_url);
      }

      const next = [...parsedImages, ...uploadedUrls];
      setImagesText(next.join("\n"));
    } catch (e) {
      console.error(e);
      alert(
        "Upload ảnh thất bại (Cloudinary). Kiểm tra preset/cloud name hoặc quyền upload.",
      );
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    const next = parsedImages.filter((x) => x !== url);
    setImagesText(next.join("\n"));
  };

  const updateSize = (idx: number, patch: Partial<SizeItem>) => {
    setDraft((p) => ({
      ...p,
      size: (p.size || []).map((it, i) =>
        i === idx ? { ...it, ...patch } : it,
      ),
    }));
  };

  const removeSize = (idx: number) => {
    setDraft((p) => ({
      ...p,
      size: (p.size || []).filter((_, i) => i !== idx),
    }));
  };

  const addSize = () => {
    setDraft((p) => ({
      ...p,
      size: [...(p.size || []), { freeSize: false, size: "", type: "" }],
    }));
  };

  const submit = async () => {
    const payload: ProductFormValues = {
      ...draft,
      price: toNumberOrZero(draft.price),
      stock: toNumberOrZero(draft.stock),
      discount: toNumberOrZero(draft.discount),
      images: parsedImages,
      color: parsedColors,
    };

    if (!payload.title.trim()) return alert("Vui lòng nhập title");
    if (!payload.description.trim()) return alert("Vui lòng nhập description");
    if (!payload.product_category_id.trim())
      return alert("Vui lòng chọn danh mục sản phẩm");
    if (payload.price <= 0) return alert("Price không hợp lệ");
    if (payload.stock < 0) return alert("Stock không hợp lệ");

    if (!payload.images.length) return alert("Vui lòng có ít nhất 1 ảnh");

    // bạn có thể lọc size rỗng nếu muốn:
    // payload.size = payload.size.filter(s => s.freeSize || (s.size.trim() && s.type.trim()));

    await onSubmit(payload);
  };

  return (
    <AdminModal
      open={open}
      title={mode === "create" ? "Add Product" : "Update Product"}
      onClose={onClose}
      widthClassName="max-w-3xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/10"
            disabled={submitting || uploading}
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-60"
            disabled={submitting || uploading}
          >
            {uploading
              ? "Uploading..."
              : submitting
                ? "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Update"}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-white/30"
          placeholder="Title"
          value={draft.title}
          onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
        />

        {/* Category select */}
        <select
          value={draft.product_category_id}
          onChange={(e) =>
            setDraft((p) => ({ ...p, product_category_id: e.target.value }))
          }
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-white/30"
        >
          <option value="">
            {catLoading ? "Loading categories..." : "Select category"}
          </option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>

        <input
          type="number"
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-white/30"
          placeholder="Price (VD: 5000000)"
          value={draft.price}
          onChange={(e) =>
            setDraft((p) => ({ ...p, price: toNumberInput(e.target.value) }))
          }
        />

        <input
          type="number"
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-white/30"
          placeholder="Stock (VD: 10)"
          value={draft.stock}
          onChange={(e) =>
            setDraft((p) => ({ ...p, stock: toNumberInput(e.target.value) }))
          }
        />

        <input
          type="number"
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-white/30"
          placeholder="Discount % (VD: 5)"
          value={draft.discount}
          onChange={(e) =>
            setDraft((p) => ({ ...p, discount: toNumberInput(e.target.value) }))
          }
        />

        <select
          value={draft.status}
          onChange={(e) =>
            setDraft((p) => ({ ...p, status: e.target.value as ProductStatus }))
          }
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm"
        >
          <option value="active">active</option>
          <option value="inactive">inactive</option>
          <option value="out_of_stock">out_of_stock</option>
        </select>

        <textarea
          className="md:col-span-2 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-white/30"
          placeholder="Description"
          value={draft.description}
          onChange={(e) =>
            setDraft((p) => ({ ...p, description: e.target.value }))
          }
          rows={3}
        />

        {/* Images */}
        <div className="md:col-span-2 rounded-xl border border-white/10 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium text-gray-200">
              Images ({parsedImages.length})
            </div>

            <label className="cursor-pointer rounded-lg border border-white/15 px-3 py-1 text-sm hover:bg-white/10">
              Upload to Cloudinary
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={(e) => handleUploadFiles(e.target.files)}
              />
            </label>
          </div>

          <textarea
            className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-white/30"
            placeholder="Paste URL ảnh (mỗi dòng 1 URL hoặc phân tách bằng dấu phẩy)"
            value={imagesText}
            onChange={(e) => setImagesText(e.target.value)}
            rows={3}
          />

          {parsedImages.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              {parsedImages.map((url) => (
                <div
                  key={url}
                  className="relative overflow-hidden rounded-lg border border-white/10"
                >
                  <img src={url} className="h-24 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-xs text-white hover:bg-black"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colors */}
        <input
          className="md:col-span-2 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-white/30"
          placeholder="Colors (phân tách bằng dấu phẩy) ví dụ: vàng, bạc"
          value={colorsText}
          onChange={(e) => setColorsText(e.target.value)}
        />

        {/* Sizes */}
        {/* <div className="md:col-span-2 rounded-xl border border-white/10 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium text-gray-200">Size</div>
            <button
              type="button"
              onClick={addSize}
              className="rounded-lg border border-white/15 px-3 py-1 text-sm hover:bg-white/10"
            >
              + Add size
            </button>
          </div>

          <div className="space-y-2">
            {(draft.size || []).map((s, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-center gap-2 rounded-lg bg-white/5 p-2"
              >
                <label className="flex items-center gap-2 text-xs text-gray-200">
                  <input
                    type="checkbox"
                    checked={s.freeSize}
                    onChange={(e) =>
                      updateSize(idx, { freeSize: e.target.checked })
                    }
                  />
                  freeSize
                </label>

                <input
                  className="flex-1 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-white/30"
                  placeholder="size (M/L/S...)"
                  value={s.size}
                  onChange={(e) => updateSize(idx, { size: e.target.value })}
                />

                <input
                  className="flex-1 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-white/30"
                  placeholder="type (standard...)"
                  value={s.type}
                  onChange={(e) => updateSize(idx, { type: e.target.value })}
                />

                <button
                  type="button"
                  onClick={() => removeSize(idx)}
                  className="rounded-lg border border-white/15 px-3 py-1 text-sm text-red-300 hover:bg-white/10"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div> */}
        {/* Sizes */}
        <div className="md:col-span-2 rounded-xl border border-white/10 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium text-gray-200">Size</div>
            <button
              type="button"
              onClick={addSize}
              className="rounded-lg border border-white/15 px-3 py-1 text-sm hover:bg-white/10"
            >
              + Add size
            </button>
          </div>

          <div className="space-y-2">
            {(draft.size || []).map((s, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-center gap-2 rounded-lg bg-white/5 p-2"
              >
                <label className="flex items-center gap-2 text-xs text-gray-200">
                  <input
                    type="checkbox"
                    checked={s.freeSize}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      updateSize(
                        idx,
                        checked
                          ? { freeSize: true, size: "", type: "" } // ✅ tick => clear
                          : { freeSize: false },
                      );
                    }}
                  />
                  freeSize
                </label>

                <input
                  disabled={s.freeSize}
                  className={`flex-1 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-white/30 ${
                    s.freeSize ? "opacity-50" : ""
                  }`}
                  placeholder={
                    s.freeSize
                      ? "Free size (không cần nhập)"
                      : "size (M/L/S...)"
                  }
                  value={s.size}
                  onChange={(e) => updateSize(idx, { size: e.target.value })}
                />

                <input
                  disabled={s.freeSize}
                  className={`flex-1 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm outline-none focus:border-white/30 ${
                    s.freeSize ? "opacity-50" : ""
                  }`}
                  placeholder={
                    s.freeSize
                      ? "Free size (không cần nhập)"
                      : "type (standard...)"
                  }
                  value={s.type}
                  onChange={(e) => updateSize(idx, { type: e.target.value })}
                />

                <button
                  type="button"
                  onClick={() => removeSize(idx)}
                  className="rounded-lg border border-white/15 px-3 py-1 text-sm text-red-300 hover:bg-white/10"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminModal>
  );
}
