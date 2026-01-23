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

      {/* Images */}
      <div className="flex gap-4">
        {product.images.map((img) => (
          <img
            key={img}
            src={img}
            alt={product.title}
            className="h-32 w-32 rounded object-cover"
          />
        ))}
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-6 text-gray-300">
        <div>
          <p className="font-semibold">Giá</p>
          <p>{product.price.toLocaleString()} đ</p>
        </div>

        <div>
          <p className="font-semibold">Tồn kho</p>
          <p>{product.stock}</p>
        </div>

        <div>
          <p className="font-semibold">Trạng thái</p>
          <p className="capitalize">{product.status}</p>
        </div>

        <div>
          <p className="font-semibold">Màu sắc</p>
          <p>{product.color.join(", ")}</p>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <p className="mb-2 font-semibold text-white">Size</p>
        <div className="flex gap-2">
          {product.size.map((s) => (
            <span key={s._id} className="rounded bg-gray-700 px-3 py-1 text-sm">
              {s.size}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <p className="mb-2 font-semibold text-white">Mô tả</p>
        <p className="text-gray-300">{product.description}</p>
      </div>
    </div>
  );
}
