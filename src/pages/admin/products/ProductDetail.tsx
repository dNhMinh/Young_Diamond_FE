// //src/pages/admin/products/ProductDetail.tsx
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { getProductDetailApi } from "../../../api/admin/product.api";
// import type { ProductDetail } from "../../../types/product";

// export default function ProductDetailPage() {
//   const { slug } = useParams();
//   const [product, setProduct] = useState<ProductDetail | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!slug) return;

//     getProductDetailApi(slug)
//       .then((res) => {
//         setProduct(res.data.data);
//       })
//       .finally(() => setLoading(false));
//   }, [slug]);

//   if (loading) return <div>Loading...</div>;
//   if (!product) return <div>Không tìm thấy sản phẩm</div>;

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold text-white">{product.title}</h1>

//       {/* Images */}
//       <div className="flex gap-4">
//         {product.images.map((img) => (
//           <img
//             key={img}
//             src={img}
//             alt={product.title}
//             className="h-32 w-32 rounded object-cover"
//           />
//         ))}
//       </div>

//       {/* Info */}
//       <div className="grid grid-cols-2 gap-6 text-gray-300">
//         <div>
//           <p className="font-semibold">Giá</p>
//           <p>{product.price.toLocaleString()} đ</p>
//         </div>

//         <div>
//           <p className="font-semibold">Tồn kho</p>
//           <p>{product.stock}</p>
//         </div>

//         <div>
//           <p className="font-semibold">Trạng thái</p>
//           <p className="capitalize">{product.status}</p>
//         </div>

//         <div>
//           <p className="font-semibold">Màu sắc</p>
//           <p>{product.color.join(", ")}</p>
//         </div>
//       </div>

//       {/* Sizes */}
//       <div>
//         <p className="mb-2 font-semibold text-white">Size</p>
//         <div className="flex gap-2">
//           {product.size.map((s) => (
//             <span key={s._id} className="rounded bg-gray-700 px-3 py-1 text-sm">
//               {s.size}
//             </span>
//           ))}
//         </div>
//       </div>

//       {/* Description */}
//       <div>
//         <p className="mb-2 font-semibold text-white">Mô tả</p>
//         <p className="text-gray-300">{product.description}</p>
//       </div>
//     </div>
//   );
// }

//src/pages/admin/products/ProductDetail.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductDetailApi } from "../../../api/admin/product.api";
import type { ProductDetail } from "../../../types/product";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    getProductDetailApi(slug)
      .then((res) => {
        setProduct(res.data.data);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Không tìm thấy sản phẩm</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{product.title}</h1>

      {/* Thumbnail */}
      <div>
        <p className="mb-2 font-semibold text-white">Thumbnail</p>
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-32 w-32 rounded object-cover"
          />
        ) : (
          <p className="text-gray-400">Không có thumbnail</p>
        )}
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-6 text-gray-300">
        <div>
          <p className="font-semibold">Giá</p>
          <p>{product.price.toLocaleString()} đ</p>
        </div>

        <div>
          <p className="font-semibold">Position</p>
          <p>{product.position ?? "-"}</p>
        </div>

        <div>
          <p className="font-semibold">Trạng thái</p>
          <p className="capitalize">{product.status}</p>
        </div>

        <div>
          <p className="font-semibold">Quản lý tồn kho</p>
          <p>
            {product.isManageStock
              ? "Không trừ tồn kho khi đặt hàng"
              : "Có trừ tồn kho khi đặt hàng"}
          </p>
        </div>

        <div>
          <p className="font-semibold">Discount</p>
          <p>{product.discount ?? 0}%</p>
        </div>

        <div>
          <p className="font-semibold">Danh mục</p>
          <p>{product.product_category_id}</p>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <p className="mb-2 font-semibold text-white">Size</p>
        <div className="flex flex-wrap gap-2">
          {(product.size ?? []).map((s, idx) => (
            <span
              key={s._id || idx}
              className="rounded bg-gray-700 px-3 py-1 text-sm">
              {s.freeSize ? "FREE" : s.size} {s.type ? `(${s.type})` : ""}
            </span>
          ))}
        </div>
      </div>

      {/* Variants */}
      <div>
        <p className="mb-3 font-semibold text-white">Variant</p>

        {(product.variant ?? []).length === 0 ? (
          <p className="text-gray-400">Không có variant</p>
        ) : (
          <div className="space-y-4">
            {product.variant?.map((v, idx) => (
              <div
                key={v._id || idx}
                className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-2 text-gray-300">
                  <div>
                    <p className="font-semibold">Màu</p>
                    <p>{v.color}</p>
                  </div>

                  <div>
                    <p className="font-semibold">Tồn kho</p>
                    <p>{v.stock}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  {(v.images ?? []).map((img) => (
                    <img
                      key={img}
                      src={img}
                      alt={v.color}
                      className="h-28 w-28 rounded object-cover"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <p className="mb-2 font-semibold text-white">Mô tả</p>
        <p className="text-gray-300">{product.description}</p>
      </div>
    </div>
  );
}
