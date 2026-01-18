import { useEffect, useState } from "react";
import {
  getAdminProductsApi,
  softDeleteProductApi,
} from "../../api/admin/product.api";
import type { ProductListItem } from "../../types/product";
import { Link } from "react-router-dom";

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  type ProductStatus = "all" | "active" | "inactive" | "out_of_stock";

  const [status, setStatus] = useState<ProductStatus>("all");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getAdminProductsApi({
        searchKey: searchKey || undefined,
        status: status === "all" ? undefined : status,
        deleted: false,
      });
      setProducts(res.data.data);
    } catch (error) {
      console.error("Fetch products failed", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchKey, status]);

  const handleSoftDelete = async (productId: string) => {
    const confirmDelete = confirm("Bạn có chắc muốn xóa tạm sản phẩm này?");
    if (!confirmDelete) return;

    try {
      await softDeleteProductApi(productId);
      fetchProducts();
    } catch (error) {
      alert("Xóa tạm sản phẩm thất bại");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Products</h2>

        <div className="flex gap-3">
          <Link
            to="/admin/products/trash"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            Trash
          </Link>

          <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200">
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
          onChange={(e) => setStatus(e.target.value as ProductStatus)}
          className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
        {/* <button
          onClick={fetchProducts}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
        >
          Apply
        </button> */}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Stock</th>
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
                  className="border-t border-white/5 hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <Link to={`/admin/products/${product.slug}`}>
                      <img
                        src={product.image}
                        alt={product.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-white">{product.title}</td>
                  <td className="px-4 py-3 text-white">
                    {product.price.toLocaleString()}₫
                  </td>
                  <td className="px-4 py-3 text-white">{product.stock}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="mr-3 text-blue-400 hover:underline">
                      Edit
                    </button>
                    <button
                      onClick={() => handleSoftDelete(product._id)}
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
      }`}
    >
      {status}
    </span>
  );
}
