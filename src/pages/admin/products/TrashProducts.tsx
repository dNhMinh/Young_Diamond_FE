//src/pages/admin/products/TrashProducts.tsx
import { useEffect, useState } from "react";
import {
  getAdminProductsApi,
  restoreProductApi,
  hardDeleteProductApi,
} from "../../../api/admin/product.api";
import type { ProductListItem } from "../../../types/product";
import { Link } from "react-router-dom";

export default function TrashProducts() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKey, setSearchKey] = useState("");

  const fetchTrashProducts = async () => {
    setLoading(true);
    try {
      const res = await getAdminProductsApi({
        searchKey: searchKey || undefined,
        deleted: true,
      });

      setProducts(res.data.data ?? []);
    } catch (error) {
      console.error("Fetch trash products failed", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashProducts();
  }, [searchKey]);

  const handleRestore = async (productId: string) => {
    const ok = confirm("Bạn có chắc muốn khôi phục sản phẩm này?");
    if (!ok) return;

    try {
      await restoreProductApi(productId);
      fetchTrashProducts();
    } catch (error) {
      console.error("Restore failed", error);
      alert("Khôi phục sản phẩm thất bại");
    }
  };

  const handleHardDelete = async (productId: string) => {
    const ok = confirm(
      "XÓA VĨNH VIỄN sản phẩm này? Hành động này không thể khôi phục.",
    );
    if (!ok) return;

    try {
      await hardDeleteProductApi(productId);
      fetchTrashProducts();
    } catch (error) {
      console.error("Hard delete failed", error);
      alert("Xóa vĩnh viễn sản phẩm thất bại");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Trash Products</h2>

        <Link
          to="/admin/products"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10">
          ← Back to Products
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          className="w-64 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          placeholder="Search deleted product..."
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
        />
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
                  Trash is empty
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
                        className="h-12 w-12 cursor-pointer rounded object-cover opacity-70"
                      />
                    </Link>
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/products/${product.slug}`}
                      className="font-medium text-white hover:underline">
                      {product.title}
                    </Link>
                  </td>

                  <td className="px-4 py-3 text-white">
                    {product.price.toLocaleString()}₫
                  </td>

                  <td className="px-4 py-3 text-white">
                    {product.position ?? "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-500/20 px-3 py-1 text-xs text-gray-400">
                      Deleted
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => handleRestore(product._id)}
                        className="text-green-400 hover:underline">
                        Restore
                      </button>

                      <button
                        onClick={() => handleHardDelete(product._id)}
                        className="text-red-400 hover:underline">
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
