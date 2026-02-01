// // src/pages/client/checkout/CheckoutPage.tsx
// import { Link, useNavigate } from "react-router-dom";
// import { useMemo, useState } from "react";
// import axios from "axios";

// import { useCart } from "../../../context/CartContext";
// import type { OrderCreatePayload } from "../../../types/order";
// import { ordersApi } from "../../../api/client/orders.api";
// import { uploadToCloudinary } from "../../../utils/cloudinary";

// type PaymentMethod = "cod" | "bank_transfer";
// type ApiErrorResponse = { message?: string };

// function formatVND(value: number) {
//   return new Intl.NumberFormat("vi-VN", {
//     style: "currency",
//     currency: "VND",
//     maximumFractionDigits: 0,
//   }).format(value);
// }

// function isImageFile(file: File) {
//   return file.type.startsWith("image/");
// }

// const MAX_PROOF_MB = 8;

// export default function CheckoutPage() {
//   const nav = useNavigate();
//   const { state, totals, clear } = useCart();

//   // form shipping
//   const [fullName, setFullName] = useState("");
//   const [address, setAddress] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [email, setEmail] = useState("");
//   const [note, setNote] = useState("");

//   // shipping carrier
//   const [shippingCarrierCode, setShippingCarrierCode] = useState("JNT");

//   // payment
//   const [method, setMethod] = useState<PaymentMethod>("cod");
//   const [proofUrl, setProofUrl] = useState<string>("");
//   const [uploading, setUploading] = useState(false);

//   const [submitting, setSubmitting] = useState(false);
//   const [errMsg, setErrMsg] = useState<string | null>(null);

//   const canSubmit = useMemo(() => {
//     if (state.items.length === 0) return false;
//     if (
//       !fullName.trim() ||
//       !address.trim() ||
//       !phoneNumber.trim() ||
//       !email.trim()
//     )
//       return false;
//     if (method === "bank_transfer" && !proofUrl) return false;
//     return true;
//   }, [
//     state.items.length,
//     fullName,
//     address,
//     phoneNumber,
//     email,
//     method,
//     proofUrl,
//   ]);

//   const onChangeMethod = (m: PaymentMethod) => {
//     setMethod(m);
//     setErrMsg(null);

//     // Nếu đổi về COD thì bỏ proof cho sạch UI
//     if (m === "cod") setProofUrl("");
//   };

//   const onUploadProof = async (file: File) => {
//     setErrMsg(null);

//     if (!isImageFile(file)) {
//       setErrMsg("Vui lòng chọn file ảnh (JPG/PNG/WebP).");
//       return;
//     }

//     const sizeMb = file.size / (1024 * 1024);
//     if (sizeMb > MAX_PROOF_MB) {
//       setErrMsg(
//         `Ảnh quá lớn (${sizeMb.toFixed(1)}MB). Vui lòng chọn ảnh ≤ ${MAX_PROOF_MB}MB.`,
//       );
//       return;
//     }

//     setUploading(true);
//     try {
//       const result = await uploadToCloudinary(file);
//       // util trả secure_url
//       setProofUrl(result.secure_url);
//     } catch (e: unknown) {
//       const msg = e instanceof Error ? e.message : "Upload thất bại";
//       setErrMsg(msg);
//     } finally {
//       setUploading(false);
//     }
//   };

//   const onPlaceOrder = async () => {
//     if (!canSubmit) return;

//     setSubmitting(true);
//     setErrMsg(null);

//     const payload: OrderCreatePayload = {
//       shippingInfo: {
//         fullName: fullName.trim(),
//         address: address.trim(),
//         phoneNumber: phoneNumber.trim(),
//         email: email.trim(),
//         note: note.trim() || undefined,
//       },
//       products: state.items.map((it) => ({
//         productId: it.productId,
//         quantity: it.quantity,
//         // gửi giá sau giảm để backend tính đúng total
//         price:
//           typeof it.discount === "number" && it.discount > 0
//             ? Math.round(it.price * (1 - it.discount / 100))
//             : it.price,
//       })),
//       payment: {
//         method,
//         imageCheckPayment: method === "bank_transfer" ? proofUrl : undefined,
//       },

//       // ✅ giữ tương thích cũ
//       shippingCarrier: shippingCarrierCode,
//       // ✅ nếu backend đang dùng code riêng
//       shippingCarrierCode,
//     };

//     try {
//       const res = await ordersApi.create(payload);
//       const code = res.data.orderCode;

//       clear();
//       nav(`/order-success?code=${encodeURIComponent(code)}`);
//     } catch (e: unknown) {
//       let msg = "Đặt hàng thất bại. Vui lòng thử lại.";
//       if (axios.isAxiosError<ApiErrorResponse>(e)) {
//         msg = e.response?.data?.message || msg;
//       } else if (e instanceof Error) {
//         msg = e.message || msg;
//       }
//       setErrMsg(msg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (state.items.length === 0) {
//     return (
//       <div className="bg-white text-black">
//         <div className="max-w-7xl mx-auto px-4 py-10">
//           <div className="text-sm text-neutral-600">Giỏ hàng đang trống.</div>
//           <Link to="/products" className="inline-block mt-4 text-sm underline">
//             Quay lại mua sắm
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white text-black">
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <div className="flex items-end justify-between gap-4">
//           <h1 className="text-2xl md:text-3xl font-semibold tracking-wide">
//             Thanh toán
//           </h1>
//           <Link
//             to="/cart"
//             className="text-sm underline text-neutral-700 hover:text-black"
//           >
//             ← Quay lại giỏ hàng
//           </Link>
//         </div>

//         <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
//           {/* left: form */}
//           <div className="lg:col-span-7 space-y-8">
//             {/* shipping */}
//             <div className="border border-black/10 rounded-xl p-5">
//               <div className="text-sm font-semibold tracking-wide mb-4">
//                 Thông tin giao hàng
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <label className="grid gap-2">
//                   <span className="text-xs text-neutral-600">Họ tên</span>
//                   <input
//                     value={fullName}
//                     onChange={(e) => setFullName(e.target.value)}
//                     className="h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black"
//                     placeholder="Nguyễn Văn A"
//                   />
//                 </label>

//                 <label className="grid gap-2">
//                   <span className="text-xs text-neutral-600">SĐT</span>
//                   <input
//                     value={phoneNumber}
//                     onChange={(e) => setPhoneNumber(e.target.value)}
//                     className="h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black"
//                     placeholder="09xxxxxxxx"
//                   />
//                 </label>

//                 <label className="grid gap-2 md:col-span-2">
//                   <span className="text-xs text-neutral-600">Địa chỉ</span>
//                   <input
//                     value={address}
//                     onChange={(e) => setAddress(e.target.value)}
//                     className="h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black"
//                     placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
//                   />
//                 </label>

//                 <label className="grid gap-2 md:col-span-2">
//                   <span className="text-xs text-neutral-600">Email</span>
//                   <input
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black"
//                     placeholder="you@example.com"
//                   />
//                 </label>

//                 <label className="grid gap-2 md:col-span-2">
//                   <span className="text-xs text-neutral-600">
//                     Ghi chú (tuỳ chọn)
//                   </span>
//                   <textarea
//                     value={note}
//                     onChange={(e) => setNote(e.target.value)}
//                     className="min-h-24 p-3 rounded-lg border border-black/15 outline-none focus:border-black"
//                     placeholder="Giao giờ hành chính, gọi trước khi giao..."
//                   />
//                 </label>
//               </div>
//             </div>

//             {/* shipping carrier */}
//             <div className="border border-black/10 rounded-xl p-5">
//               <div className="text-sm font-semibold tracking-wide mb-4">
//                 Vận chuyển
//               </div>

//               <label className="grid gap-2">
//                 <span className="text-xs text-neutral-600">
//                   Đơn vị vận chuyển
//                 </span>
//                 <select
//                   value={shippingCarrierCode}
//                   onChange={(e) => setShippingCarrierCode(e.target.value)}
//                   className="h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black bg-white"
//                 >
//                   <option value="JNT">J&T Express (JNT)</option>
//                   <option value="GHN">Giao Hàng Nhanh (GHN)</option>
//                   <option value="GHTK">Giao Hàng Tiết Kiệm (GHTK)</option>
//                   <option value="VNPOST">VNPost</option>
//                 </select>
//               </label>
//               <div className="mt-2 text-xs text-neutral-500">
//                 * Bạn có thể thay danh sách này theo backend thực tế.
//               </div>
//             </div>

//             {/* payment */}
//             <div className="border border-black/10 rounded-xl p-5">
//               <div className="text-sm font-semibold tracking-wide mb-4">
//                 Thanh toán
//               </div>

//               <div className="grid gap-3">
//                 <label className="flex items-start gap-3 p-3 rounded-xl border border-black/10 hover:border-black/30 cursor-pointer">
//                   <input
//                     type="radio"
//                     checked={method === "cod"}
//                     onChange={() => onChangeMethod("cod")}
//                     className="mt-1"
//                   />
//                   <div>
//                     <div className="text-sm font-semibold">COD</div>
//                     <div className="text-xs text-neutral-600">
//                       Thanh toán khi nhận hàng.
//                     </div>
//                   </div>
//                 </label>

//                 <label className="flex items-start gap-3 p-3 rounded-xl border border-black/10 hover:border-black/30 cursor-pointer">
//                   <input
//                     type="radio"
//                     checked={method === "bank_transfer"}
//                     onChange={() => onChangeMethod("bank_transfer")}
//                     className="mt-1"
//                   />
//                   <div className="flex-1">
//                     <div className="text-sm font-semibold">
//                       Chuyển khoản ngân hàng
//                     </div>
//                     <div className="text-xs text-neutral-600">
//                       Upload ảnh chứng từ để xác nhận thanh toán.
//                     </div>

//                     {method === "bank_transfer" ? (
//                       <div className="mt-3 grid gap-2">
//                         <input
//                           type="file"
//                           accept="image/*"
//                           onChange={(e) => {
//                             const f = e.target.files?.[0];
//                             if (f) void onUploadProof(f);
//                           }}
//                         />

//                         {uploading ? (
//                           <div className="text-xs text-neutral-500">
//                             Đang upload...
//                           </div>
//                         ) : null}

//                         {proofUrl ? (
//                           <div className="mt-2 flex items-center gap-3">
//                             <img
//                               src={proofUrl}
//                               alt="payment proof"
//                               className="h-16 w-16 rounded-lg object-cover border border-black/10"
//                             />
//                             <button
//                               type="button"
//                               onClick={() => setProofUrl("")}
//                               className="text-xs underline text-neutral-600 hover:text-black"
//                             >
//                               Xoá ảnh
//                             </button>
//                           </div>
//                         ) : null}
//                       </div>
//                     ) : null}
//                   </div>
//                 </label>
//               </div>
//             </div>

//             {errMsg ? (
//               <div className="text-sm text-red-600">{errMsg}</div>
//             ) : null}
//           </div>

//           {/* right: summary */}
//           <div className="lg:col-span-5">
//             <div className="border border-black/10 rounded-xl p-5">
//               <div className="text-sm font-semibold tracking-wide">
//                 Tóm tắt đơn hàng
//               </div>

//               <div className="mt-4 space-y-3 text-sm">
//                 <div className="flex items-center justify-between">
//                   <span className="text-neutral-700">Tạm tính</span>
//                   <span>{formatVND(totals.subtotal)}</span>
//                 </div>

//                 {totals.discountAmount > 0 ? (
//                   <div className="flex items-center justify-between">
//                     <span className="text-neutral-700">Giảm giá</span>
//                     <span>-{formatVND(totals.discountAmount)}</span>
//                   </div>
//                 ) : null}

//                 <div className="pt-3 border-t border-black/10 flex items-center justify-between">
//                   <span className="font-semibold">Thành tiền</span>
//                   <span className="font-semibold">
//                     {formatVND(totals.total)}
//                   </span>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={onPlaceOrder}
//                 disabled={!canSubmit || submitting || uploading}
//                 className={[
//                   "mt-5 w-full h-12 rounded-xl text-sm font-semibold transition",
//                   !canSubmit || submitting || uploading
//                     ? "bg-black/20 text-black/50 cursor-not-allowed"
//                     : "bg-black text-white hover:opacity-95",
//                 ].join(" ")}
//               >
//                 {submitting ? "Đang đặt hàng..." : "Đặt hàng"}
//               </button>

//               <div className="mt-3 text-xs text-neutral-500">
//                 * Bấm “Đặt hàng” là bạn đồng ý với chính sách mua hàng của
//                 YoungDiamond.
//               </div>
//             </div>

//             <div className="mt-6 border border-black/10 rounded-xl p-5">
//               <div className="text-sm font-semibold tracking-wide mb-3">
//                 Sản phẩm
//               </div>

//               <div className="grid gap-3">
//                 {state.items.map((it) => (
//                   <div
//                     key={`${it.productId}-${it.sizeId ?? "na"}-${it.color ?? "na"}`}
//                     className="flex gap-3"
//                   >
//                     <div className="h-14 w-14 rounded-lg overflow-hidden border border-black/10 bg-neutral-50 shrink-0">
//                       <img
//                         src={it.image}
//                         alt={it.title}
//                         className="h-full w-full object-cover"
//                       />
//                     </div>
//                     <div className="min-w-0 flex-1">
//                       <div className="text-sm font-semibold truncate">
//                         {it.title}
//                       </div>
//                       <div className="text-xs text-neutral-600 mt-1">
//                         SL: {it.quantity}
//                         {it.color ? ` • ${it.color}` : ""}
//                         {it.sizeLabel ? ` • ${it.sizeLabel}` : ""}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/client/checkout/CheckoutPage.tsx
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import axios from "axios";

import { useCart } from "../../../context/CartContext";
import type {
  OrderCreatePayload,
  OrderCreateResponse,
} from "../../../types/order";
import { ordersApi } from "../../../api/client/orders.api";
import { uploadToCloudinary } from "../../../utils/cloudinary";

type PaymentMethod = "cod" | "bank_transfer";
type ApiErrorResponse = { message?: string };

function formatVND(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

const MAX_PROOF_MB = 8;

// ✅ Set cố định theo BE
const DEFAULT_SHIPPING_CARRIER = "self_delivery" as const;

// ✅ Chỉ hiển thị UI, KHÔNG gửi BE
const SHIPPING_FEE = 40_000;

export default function CheckoutPage() {
  const nav = useNavigate();
  const { state, totals, clear } = useCart();

  // form shipping
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  // payment
  const [method, setMethod] = useState<PaymentMethod>("cod");
  const [proofUrl, setProofUrl] = useState<string>("");
  const [proofName, setProofName] = useState<string>("");

  const [uploading, setUploading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (state.items.length === 0) return false;
    if (
      !fullName.trim() ||
      !address.trim() ||
      !phoneNumber.trim() ||
      !email.trim()
    )
      return false;
    if (method === "bank_transfer" && !proofUrl) return false;
    return true;
  }, [
    state.items.length,
    fullName,
    address,
    phoneNumber,
    email,
    method,
    proofUrl,
  ]);

  // ✅ tổng tiền hiển thị có cộng ship (UI only)
  const totalWithShipping = useMemo(() => {
    return totals.total + SHIPPING_FEE;
  }, [totals.total]);

  const onChangeMethod = (m: PaymentMethod) => {
    setMethod(m);
    setErrMsg(null);

    // Nếu đổi về COD thì bỏ proof cho sạch UI
    if (m === "cod") {
      setProofUrl("");
      setProofName("");
    }
  };

  const onUploadProof = async (file: File) => {
    setProofName(file.name);

    setErrMsg(null);

    if (!isImageFile(file)) {
      setErrMsg("Vui lòng chọn file ảnh (JPG/PNG/WebP).");
      return;
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_PROOF_MB) {
      setErrMsg(
        `Ảnh quá lớn (${sizeMb.toFixed(1)}MB). Vui lòng chọn ảnh ≤ ${MAX_PROOF_MB}MB.`,
      );
      return;
    }

    setUploading(true);
    try {
      const result = await uploadToCloudinary(file);
      setProofUrl(result.secure_url);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload thất bại";
      setErrMsg(msg);
    } finally {
      setUploading(false);
    }
  };

  const onPlaceOrder = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    setErrMsg(null);

    const payload: OrderCreatePayload = {
      shippingInfo: {
        fullName: fullName.trim(),
        address: address.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        note: note.trim() || undefined,
      },
      products: state.items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        // ✅ vẫn gửi giá sau giảm (nếu có)
        price:
          typeof it.discount === "number" && it.discount > 0
            ? Math.round(it.price * (1 - it.discount / 100))
            : it.price,
      })),
      payment: {
        method,
        imageCheckPayment: method === "bank_transfer" ? proofUrl : undefined,
      },

      // ✅ set cố định theo BE
      shippingCarrier: DEFAULT_SHIPPING_CARRIER,
      shippingCarrierCode: DEFAULT_SHIPPING_CARRIER,
      // ❌ KHÔNG gửi shippingFee lên BE (chỉ UI)
    };

    try {
      const res = await ordersApi.create(payload);
      // res.data là OrderCreateResponse (= OrderDetail) theo types/order.ts bạn gửi
      const code = (res.data as OrderCreateResponse).orderCode;

      clear();
      nav(`/order/success?code=${encodeURIComponent(code)}`);
    } catch (e: unknown) {
      let msg = "Đặt hàng thất bại. Vui lòng thử lại.";
      if (axios.isAxiosError<ApiErrorResponse>(e)) {
        msg = e.response?.data?.message || msg;
      } else if (e instanceof Error) {
        msg = e.message || msg;
      }
      setErrMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-sm text-neutral-600">Giỏ hàng đang trống.</div>
          <Link to="/products" className="inline-block mt-4 text-sm underline">
            Quay lại mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-wide">
            Thanh toán
          </h1>
          <Link
            to="/cart"
            className="text-sm underline text-neutral-700 hover:text-black"
          >
            ← Quay lại giỏ hàng
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* left: form */}
          <div className="lg:col-span-7 space-y-8">
            {/* shipping */}
            <div className="border border-black/10 rounded-xl p-5">
              <div className="text-sm font-semibold tracking-wide mb-4">
                Thông tin giao hàng
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="grid gap-2">
                  <span className="text-xs text-neutral-600">Họ tên</span>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black"
                    placeholder="Nguyễn Văn A"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs text-neutral-600">SĐT</span>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black"
                    placeholder="09xxxxxxxx"
                  />
                </label>

                <label className="grid gap-2 md:col-span-2">
                  <span className="text-xs text-neutral-600">Địa chỉ</span>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  />
                </label>

                <label className="grid gap-2 md:col-span-2">
                  <span className="text-xs text-neutral-600">Email</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black"
                    placeholder="you@example.com"
                  />
                </label>

                <label className="grid gap-2 md:col-span-2">
                  <span className="text-xs text-neutral-600">
                    Ghi chú (tuỳ chọn)
                  </span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-24 p-3 rounded-lg border border-black/15 outline-none focus:border-black"
                    placeholder="Giao giờ hành chính, gọi trước khi giao..."
                  />
                </label>
              </div>
            </div>

            {/* payment */}
            <div className="border border-black/10 rounded-xl p-5">
              <div className="text-sm font-semibold tracking-wide mb-4">
                Thanh toán
              </div>

              <div className="grid gap-3">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-black/10 hover:border-black/30 cursor-pointer">
                  <input
                    type="radio"
                    checked={method === "cod"}
                    onChange={() => onChangeMethod("cod")}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-sm font-semibold">COD</div>
                    <div className="text-xs text-neutral-600">
                      Thanh toán khi nhận hàng.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-black/10 hover:border-black/30 cursor-pointer">
                  <input
                    type="radio"
                    checked={method === "bank_transfer"}
                    onChange={() => onChangeMethod("bank_transfer")}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">
                      Chuyển khoản ngân hàng
                    </div>
                    <div className="text-xs text-neutral-600">
                      Upload ảnh chứng từ để xác nhận thanh toán.
                    </div>

                    {method === "bank_transfer" ? (
                      <div className="mt-3 grid gap-3">
                        {/* Hidden input */}
                        <input
                          id="payment-proof"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void onUploadProof(f);
                          }}
                        />

                        {/* Pretty button */}
                        <div className="flex flex-wrap items-center gap-3">
                          <label
                            htmlFor="payment-proof"
                            className={[
                              "inline-flex items-center justify-center",
                              "h-10 px-4 rounded-lg border text-sm font-semibold",
                              "transition cursor-pointer select-none",
                              uploading
                                ? "border-black/10 bg-black/5 text-black/40 cursor-not-allowed"
                                : "border-black/20 hover:border-black/40 hover:bg-black/5",
                            ].join(" ")}
                          >
                            {uploading ? "Đang upload..." : "Chọn ảnh chứng từ"}
                          </label>

                          <div className="text-xs text-neutral-600">
                            {proofName ? (
                              <span className="inline-flex items-center gap-2">
                                <span className="max-w-[220px] truncate">
                                  {proofName}
                                </span>
                                <span className="text-neutral-400">•</span>
                                <span className="text-neutral-500">
                                  tối đa {MAX_PROOF_MB}MB
                                </span>
                              </span>
                            ) : (
                              <span>
                                Chỉ nhận ảnh (JPG/PNG/WebP) • tối đa{" "}
                                {MAX_PROOF_MB}MB
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Preview + remove */}
                        {proofUrl ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={proofUrl}
                              alt="payment proof"
                              className="h-16 w-16 rounded-lg object-cover border border-black/10"
                            />
                            <div className="min-w-0">
                              <div className="text-xs text-neutral-700 font-semibold">
                                Đã tải lên
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setProofUrl("");
                                  setProofName("");
                                }}
                                className="mt-1 text-xs underline text-neutral-600 hover:text-black"
                              >
                                Xoá ảnh
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </label>
              </div>
            </div>

            {errMsg ? (
              <div className="text-sm text-red-600">{errMsg}</div>
            ) : null}
          </div>

          {/* right: summary */}
          <div className="lg:col-span-5">
            <div className="border border-black/10 rounded-xl p-5">
              <div className="text-sm font-semibold tracking-wide">
                Tóm tắt đơn hàng
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-700">Tạm tính</span>
                  <span>{formatVND(totals.subtotal)}</span>
                </div>

                {totals.discountAmount > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700">Giảm giá</span>
                    <span>-{formatVND(totals.discountAmount)}</span>
                  </div>
                ) : null}

                <div className="flex items-center justify-between">
                  <span className="text-neutral-700">Phí vận chuyển</span>
                  <span>{formatVND(SHIPPING_FEE)}</span>
                </div>

                <div className="pt-3 border-t border-black/10 flex items-center justify-between">
                  <span className="font-semibold">Thành tiền</span>
                  <span className="font-semibold">
                    {formatVND(totalWithShipping)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onPlaceOrder}
                disabled={!canSubmit || submitting || uploading}
                className={[
                  "mt-5 w-full h-12 rounded-xl text-sm font-semibold transition",
                  !canSubmit || submitting || uploading
                    ? "bg-black/20 text-black/50 cursor-not-allowed"
                    : "bg-black text-white hover:opacity-95",
                ].join(" ")}
              >
                {submitting ? "Đang đặt hàng..." : "Đặt hàng"}
              </button>

              <div className="mt-3 text-xs text-neutral-500">
                * Bấm “Đặt hàng” là bạn đồng ý với chính sách mua hàng của
                YoungDiamond.
              </div>
            </div>

            <div className="mt-6 border border-black/10 rounded-xl p-5">
              <div className="text-sm font-semibold tracking-wide mb-3">
                Sản phẩm
              </div>

              <div className="grid gap-3">
                {state.items.map((it) => (
                  <div
                    key={`${it.productId}-${it.sizeId ?? "na"}-${it.color ?? "na"}`}
                    className="flex gap-3"
                  >
                    <div className="h-14 w-14 rounded-lg overflow-hidden border border-black/10 bg-neutral-50 shrink-0">
                      <img
                        src={it.image}
                        alt={it.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">
                        {it.title}
                      </div>
                      <div className="text-xs text-neutral-600 mt-1">
                        SL: {it.quantity}
                        {it.color ? ` • ${it.color}` : ""}
                        {it.sizeLabel ? ` • ${it.sizeLabel}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
