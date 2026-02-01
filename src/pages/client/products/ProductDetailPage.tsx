// // src/pages/client/products/ProductDetailPage.tsx
// import { Link, useParams } from "react-router-dom";
// import { useEffect, useMemo, useState } from "react";
// import axios from "axios";

// import ProductGallery from "../../../components/client/products/ProductGallery";
// import { productsApi } from "../../../api/client/products.api";
// import type { ProductDetail, ProductSize } from "../../../types/product";

// type ApiErrorResponse = {
//   message?: string;
// };

// function formatVND(value: number) {
//   return new Intl.NumberFormat("vi-VN", {
//     style: "currency",
//     currency: "VND",
//     maximumFractionDigits: 0,
//   }).format(value);
// }

// function AccordionRow({
//   title,
//   children,
//   defaultOpen = false,
// }: {
//   title: string;
//   children: React.ReactNode;
//   defaultOpen?: boolean;
// }) {
//   const [open, setOpen] = useState(defaultOpen);
//   return (
//     <div className="border-t border-black/10">
//       <button
//         type="button"
//         onClick={() => setOpen((v) => !v)}
//         className="w-full py-4 flex items-center justify-between text-left"
//       >
//         <span className="text-sm tracking-wide text-black">{title}</span>
//         <span className="text-lg leading-none text-black/70">
//           {open ? "–" : "+"}
//         </span>
//       </button>
//       {open ? (
//         <div className="pb-5 text-sm text-neutral-600 leading-relaxed">
//           {children}
//         </div>
//       ) : null}
//     </div>
//   );
// }

// export default function ProductDetailPage() {
//   const { slug } = useParams<{ slug: string }>();

//   const [product, setProduct] = useState<ProductDetail | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [errMsg, setErrMsg] = useState<string | null>(null);

//   // size/color
//   const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
//   const [selectedColor, setSelectedColor] = useState<string | null>(null);

//   useEffect(() => {
//     let alive = true;

//     const run = async () => {
//       if (!slug) {
//         setErrMsg("Thiếu slug sản phẩm.");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         setErrMsg(null);

//         const res = await productsApi.detailBySlug(slug);
//         if (!alive) return;

//         const p = res.data;
//         setProduct(p);

//         // default size/color
//         const firstSize = p.size?.[0]?._id || null;
//         const firstColor = p.color?.[0] || null;
//         setSelectedSizeId(firstSize);
//         setSelectedColor(firstColor);
//       } catch (err: unknown) {
//         console.error(err);
//         if (!alive) return;

//         let message = "Không lấy được chi tiết sản phẩm. Vui lòng thử lại.";
//         if (axios.isAxiosError<ApiErrorResponse>(err)) {
//           message = err.response?.data?.message || message;
//         } else if (err instanceof Error) {
//           message = err.message || message;
//         }
//         setErrMsg(message);
//       } finally {
//         if (alive) setLoading(false);
//       }
//     };

//     run();
//     return () => {
//       alive = false;
//     };
//   }, [slug]);

//   const images = useMemo(
//     () => product?.images?.filter(Boolean) || [],
//     [product],
//   );

//   const inStock = useMemo(() => {
//     if (!product) return false;
//     if (product.status !== "active") return false;
//     return (product.stock || 0) > 0;
//   }, [product]);

//   const selectedSize: ProductSize | null = useMemo(() => {
//     if (!product || !selectedSizeId) return null;
//     return product.size?.find((s) => s._id === selectedSizeId) || null;
//   }, [product, selectedSizeId]);

//   const hasDiscount = useMemo(() => {
//     return typeof product?.discount === "number" && product.discount > 0;
//   }, [product?.discount]);

//   const discountedPrice = useMemo(() => {
//     if (!product) return 0;
//     if (!hasDiscount || !product.discount) return product.price;
//     return Math.round(product.price * (1 - product.discount / 100));
//   }, [product, hasDiscount]);

//   const crumbs = useMemo(() => {
//     const title = product?.title || "Product";
//     return [
//       { label: "Home", to: "/" },
//       { label: "Sản phẩm", to: "/products" },
//       { label: title, to: `/products/${slug || ""}` },
//     ];
//   }, [product?.title, slug]);

//   const onAddToBag = () => {
//     if (!product) return;
//     if (!inStock) return;

//     console.log("ADD TO BAG", {
//       productId: product._id,
//       sizeId: selectedSizeId,
//       size: selectedSize?.size,
//       color: selectedColor,
//       qty: 1,
//     });
//   };

//   if (loading) {
//     return (
//       <div className="bg-white text-black">
//         <div className="max-w-7xl mx-auto px-4 py-10">
//           <div className="text-sm text-neutral-500">Loading product...</div>
//         </div>
//       </div>
//     );
//   }

//   if (errMsg || !product) {
//     return (
//       <div className="bg-white text-black">
//         <div className="max-w-7xl mx-auto px-4 py-10">
//           <div className="text-sm text-red-600">{errMsg || "Not found"}</div>
//           <Link to="/products" className="inline-block mt-4 text-sm underline">
//             Quay lại danh sách sản phẩm
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white text-black">
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         {/* Breadcrumb */}
//         <div className="text-sm text-neutral-500 flex flex-wrap items-center gap-2 mb-8">
//           {crumbs.map((c, idx) => (
//             <span key={c.to} className="flex items-center gap-2">
//               <Link to={c.to} className="hover:text-black">
//                 {c.label}
//               </Link>
//               {idx < crumbs.length - 1 ? (
//                 <span className="text-neutral-300">›</span>
//               ) : null}
//             </span>
//           ))}
//         </div>

//         {/* Main */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
//           {/* Gallery (✅ giữ zoom như cũ nằm trong ProductGallery) */}
//           <div className="lg:col-span-7">
//             <ProductGallery images={images} title={product.title} />
//           </div>

//           {/* Info */}
//           <div className="lg:col-span-5">
//             <h1 className="text-2xl md:text-3xl tracking-wide font-semibold">
//               {product.title}
//             </h1>

//             {/* Price */}
//             <div className="mt-4 flex flex-wrap items-center gap-3">
//               <div className="text-lg tracking-wide text-black font-semibold">
//                 {formatVND(discountedPrice)}
//               </div>

//               {hasDiscount ? (
//                 <>
//                   <div className="text-sm text-neutral-400 line-through">
//                     {formatVND(product.price)}
//                   </div>

//                   {/* Badge discount */}
//                   <span className="inline-flex items-center h-6 px-2 rounded-full text-[11px] font-semibold tracking-[0.14em] uppercase bg-black text-white">
//                     -{product.discount}%
//                   </span>
//                 </>
//               ) : null}
//             </div>

//             {/* SIZE */}
//             <div className="mt-10 flex items-center justify-between">
//               <div className="text-sm tracking-wide text-black">size:</div>
//               <button
//                 type="button"
//                 className="text-sm underline text-neutral-500 hover:text-black"
//               >
//                 size &amp; fit
//               </button>
//             </div>

//             <div className="mt-4 flex items-center gap-3 flex-wrap">
//               {(product.size || []).map((s) => {
//                 const active = s._id === selectedSizeId;
//                 return (
//                   <button
//                     key={s._id}
//                     type="button"
//                     onClick={() => setSelectedSizeId(s._id)}
//                     className={[
//                       "h-12 w-16 border text-sm tracking-wide transition",
//                       active
//                         ? "border-black text-black"
//                         : "border-black/30 text-black/70 hover:border-black/60",
//                     ].join(" ")}
//                     title={s.freeSize ? "Free size" : s.type}
//                   >
//                     {s.freeSize ? "FREE" : s.size}
//                   </button>
//                 );
//               })}
//             </div>

//             {/* COLOR */}
//             {product.color?.length ? (
//               <>
//                 <div className="mt-8 text-sm tracking-wide text-black">
//                   color:
//                 </div>
//                 <div className="mt-3 flex items-center gap-3 flex-wrap">
//                   {product.color.map((c) => {
//                     const active = c === selectedColor;
//                     return (
//                       <button
//                         key={c}
//                         type="button"
//                         onClick={() => setSelectedColor(c)}
//                         className={[
//                           "h-10 px-4 border text-sm tracking-wide capitalize transition",
//                           active
//                             ? "border-black text-black"
//                             : "border-black/30 text-black/70 hover:border-black/60",
//                         ].join(" ")}
//                       >
//                         {c}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </>
//             ) : null}

//             {/* Add to bag */}
//             <button
//               type="button"
//               onClick={onAddToBag}
//               disabled={!inStock}
//               className={[
//                 "mt-8 w-full h-14 flex items-center justify-between px-6 tracking-wide transition",
//                 inStock
//                   ? "bg-black text-white hover:opacity-95"
//                   : "bg-black/30 text-white/70 cursor-not-allowed",
//               ].join(" ")}
//             >
//               <span className="text-sm font-semibold">
//                 {inStock ? "ADD TO BAG" : "OUT OF STOCK"}
//               </span>
//               <span className="text-lg">▢</span>
//             </button>

//             {/* divider */}
//             <div className="mt-8 border-t border-black/10" />

//             {/* details */}
//             <div className="mt-6">
//               <div className="text-sm font-semibold tracking-wide text-black">
//                 details
//               </div>

//               <ul className="mt-4 space-y-2 text-sm text-neutral-700">
//                 {product.description ? (
//                   <li className="leading-relaxed">{product.description}</li>
//                 ) : null}
//                 <li className="leading-relaxed">
//                   Status: <span className="uppercase">{product.status}</span>
//                 </li>
//                 <li className="leading-relaxed">Stock: {product.stock}</li>
//               </ul>
//             </div>

//             {/* accordion */}
//             <div className="mt-8">
//               <AccordionRow title="Chính Sách Thanh Toán" defaultOpen>
//                 Thanh toán COD / chuyển khoản.
//               </AccordionRow>
//               <AccordionRow title="Vận Chuyển & Đổi Trả">
//                 Giao hàng 1–3 ngày nội thành, 3–7 ngày toàn quốc. Đổi trả trong
//                 7 ngày.
//               </AccordionRow>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/client/products/ProductDetailPage.tsx
import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import ProductGallery from "../../../components/client/products/ProductGallery";
import { productsApi } from "../../../api/client/products.api";
import type { ProductDetail, ProductSize } from "../../../types/product";
import { useCart } from "../../../context/CartContext";

type ApiErrorResponse = {
  message?: string;
};

function formatVND(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function AccordionRow({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-black/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full py-4 flex items-center justify-between text-left"
      >
        <span className="text-sm tracking-wide text-black">{title}</span>
        <span className="text-lg leading-none text-black/70">
          {open ? "–" : "+"}
        </span>
      </button>
      {open ? (
        <div className="pb-5 text-sm text-neutral-600 leading-relaxed">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // size/color
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // ✅ cart
  const { addItem } = useCart();

  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (!slug) {
        setErrMsg("Thiếu slug sản phẩm.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrMsg(null);

        const res = await productsApi.detailBySlug(slug);
        if (!alive) return;

        const p = res.data;
        setProduct(p);

        // default size/color
        const firstSize = p.size?.[0]?._id || null;
        const firstColor = p.color?.[0] || null;
        setSelectedSizeId(firstSize);
        setSelectedColor(firstColor);
      } catch (err: unknown) {
        console.error(err);
        if (!alive) return;

        let message = "Không lấy được chi tiết sản phẩm. Vui lòng thử lại.";
        if (axios.isAxiosError<ApiErrorResponse>(err)) {
          message = err.response?.data?.message || message;
        } else if (err instanceof Error) {
          message = err.message || message;
        }
        setErrMsg(message);
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [slug]);

  const images = useMemo(
    () => product?.images?.filter(Boolean) || [],
    [product],
  );

  const inStock = useMemo(() => {
    if (!product) return false;
    if (product.status !== "active") return false;
    return (product.stock || 0) > 0;
  }, [product]);

  const selectedSize: ProductSize | null = useMemo(() => {
    if (!product || !selectedSizeId) return null;
    return product.size?.find((s) => s._id === selectedSizeId) || null;
  }, [product, selectedSizeId]);

  const hasDiscount = useMemo(() => {
    return typeof product?.discount === "number" && product.discount > 0;
  }, [product?.discount]);

  const discountedPrice = useMemo(() => {
    if (!product) return 0;
    if (!hasDiscount || !product.discount) return product.price;
    return Math.round(product.price * (1 - product.discount / 100));
  }, [product, hasDiscount]);

  const crumbs = useMemo(() => {
    const title = product?.title || "Product";
    return [
      { label: "Home", to: "/" },
      { label: "Sản phẩm", to: "/products" },
      { label: title, to: `/products/${slug || ""}` },
    ];
  }, [product?.title, slug]);

  const onAddToBag = () => {
    if (!product) return;
    if (!inStock) return;

    // ✅ Lấy ảnh đại diện: ưu tiên images[0], fallback thumbnail nếu có
    const thumb =
      images[0] ||
      (product as unknown as { thumbnail?: string }).thumbnail ||
      "";

    const sizeLabel = selectedSize
      ? selectedSize.freeSize
        ? "FREE"
        : selectedSize.size
      : undefined;

    addItem({
      productId: product._id,
      title: product.title,
      image: thumb,
      price: product.price, // giữ giá gốc
      discount:
        typeof product.discount === "number" ? product.discount : undefined,
      quantity: 1,
      sizeId: selectedSizeId,
      sizeLabel,
      color: selectedColor,
    });

    // nếu bạn muốn auto chuyển sang giỏ sau khi add thì nói mình, mình thêm 1 dòng nav("/cart")
  };

  if (loading) {
    return (
      <div className="bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-sm text-neutral-500">Loading product...</div>
        </div>
      </div>
    );
  }

  if (errMsg || !product) {
    return (
      <div className="bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-sm text-red-600">{errMsg || "Not found"}</div>
          <Link to="/products" className="inline-block mt-4 text-sm underline">
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-neutral-500 flex flex-wrap items-center gap-2 mb-8">
          {crumbs.map((c, idx) => (
            <span key={c.to} className="flex items-center gap-2">
              <Link to={c.to} className="hover:text-black">
                {c.label}
              </Link>
              {idx < crumbs.length - 1 ? (
                <span className="text-neutral-300">›</span>
              ) : null}
            </span>
          ))}
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Gallery (✅ giữ zoom như cũ nằm trong ProductGallery) */}
          <div className="lg:col-span-7">
            <ProductGallery images={images} title={product.title} />
          </div>

          {/* Info */}
          <div className="lg:col-span-5">
            <h1 className="text-2xl md:text-3xl tracking-wide font-semibold">
              {product.title}
            </h1>

            {/* Price */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="text-lg tracking-wide text-black font-semibold">
                {formatVND(discountedPrice)}
              </div>

              {hasDiscount ? (
                <>
                  <div className="text-sm text-neutral-400 line-through">
                    {formatVND(product.price)}
                  </div>

                  {/* Badge discount */}
                  <span className="inline-flex items-center h-6 px-2 rounded-full text-[11px] font-semibold tracking-[0.14em] uppercase bg-black text-white">
                    -{product.discount}%
                  </span>
                </>
              ) : null}
            </div>

            {/* SIZE */}
            <div className="mt-10 flex items-center justify-between">
              <div className="text-sm tracking-wide text-black">size:</div>
              <button
                type="button"
                className="text-sm underline text-neutral-500 hover:text-black"
              >
                size &amp; fit
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3 flex-wrap">
              {(product.size || []).map((s) => {
                const active = s._id === selectedSizeId;
                return (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => setSelectedSizeId(s._id)}
                    className={[
                      "h-12 w-16 border text-sm tracking-wide transition",
                      active
                        ? "border-black text-black"
                        : "border-black/30 text-black/70 hover:border-black/60",
                    ].join(" ")}
                    title={s.freeSize ? "Free size" : s.type}
                  >
                    {s.freeSize ? "FREE" : s.size}
                  </button>
                );
              })}
            </div>

            {/* COLOR */}
            {product.color?.length ? (
              <>
                <div className="mt-8 text-sm tracking-wide text-black">
                  color:
                </div>
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  {product.color.map((c) => {
                    const active = c === selectedColor;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={[
                          "h-10 px-4 border text-sm tracking-wide capitalize transition",
                          active
                            ? "border-black text-black"
                            : "border-black/30 text-black/70 hover:border-black/60",
                        ].join(" ")}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : null}

            {/* Add to bag */}
            <button
              type="button"
              onClick={onAddToBag}
              disabled={!inStock}
              className={[
                "mt-8 w-full h-14 flex items-center justify-between px-6 tracking-wide transition",
                inStock
                  ? "bg-black text-white hover:opacity-95"
                  : "bg-black/30 text-white/70 cursor-not-allowed",
              ].join(" ")}
            >
              <span className="text-sm font-semibold">
                {inStock ? "ADD TO BAG" : "OUT OF STOCK"}
              </span>
              <span className="text-lg">▢</span>
            </button>

            {/* divider */}
            <div className="mt-8 border-t border-black/10" />

            {/* details */}
            <div className="mt-6">
              <div className="text-sm font-semibold tracking-wide text-black">
                details
              </div>

              <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                {product.description ? (
                  <li className="leading-relaxed">{product.description}</li>
                ) : null}
                <li className="leading-relaxed">
                  Status: <span className="uppercase">{product.status}</span>
                </li>
                <li className="leading-relaxed">Stock: {product.stock}</li>
              </ul>
            </div>

            {/* accordion */}
            <div className="mt-8">
              <AccordionRow title="Chính Sách Thanh Toán" defaultOpen>
                Thanh toán COD / chuyển khoản.
              </AccordionRow>
              <AccordionRow title="Vận Chuyển & Đổi Trả">
                Giao hàng 1–3 ngày nội thành, 3–7 ngày toàn quốc. Đổi trả trong
                7 ngày.
              </AccordionRow>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
