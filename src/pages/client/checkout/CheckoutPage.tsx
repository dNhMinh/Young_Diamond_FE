// src/pages/client/checkout/CheckoutPage.tsx
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { useCart } from "../../../context/CartContext";
import type {
  OrderCreatePayload,
  OrderCreateResponse,
} from "../../../types/order";
import { ordersApi } from "../../../api/client/orders.api";
import { uploadToCloudinary } from "../../../utils/cloudinary";
import { settingsApi } from "../../../api/client/settings.api";
import type {
  PaymentMethod as SettingsPaymentMethod,
  BankAccount,
} from "../../../api/client/settings.api";

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
function removeVietnameseTones(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

const MAX_PROOF_MB = 8;

// ✅ Set cố định theo BE
const DEFAULT_SHIPPING_CARRIER = "self_delivery" as const;

// ✅ Chỉ hiển thị UI, KHÔNG gửi BE
const SHIPPING_FEE = 40_000;

export default function CheckoutPage() {
  const nav = useNavigate();
  const { state, totals, clear } = useCart();

  // ✅ QR fallback from settings (nếu bankAccount không có qrImageUrl)
  const [fallbackQrUrl, setFallbackQrUrl] = useState<string>("");
  const [loadingQr, setLoadingQr] = useState(false);

  // ✅ Payment methods/bank accounts (from settingsApi.getPaymentMethods)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string>("");

  // ✅ xác nhận chuyển khoản xong mới cho upload
  const [bankConfirmed, setBankConfirmed] = useState(false);

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

  // ✅ fetch settings + payment methods (1 lần)
  useEffect(() => {
    let alive = true;

    (async () => {
      // 1) Settings: fallback QR
      setLoadingQr(true);
      try {
        const res = await settingsApi.getSettings();
        const url = res?.data?.paymentQRImageUrl || "";
        if (alive) setFallbackQrUrl(url);
      } catch (e) {
        console.error("Failed to load settings QR:", e);
      } finally {
        if (alive) setLoadingQr(false);
      }

      // 2) Payment methods: bank accounts
      setLoadingBanks(true);
      try {
        const res = await settingsApi.getPaymentMethods();
        const methods: SettingsPaymentMethod[] = res?.data || [];

        // chọn những bank accounts active
        const activeBanks =
          methods
            .filter((m) => m?.isActive)
            .flatMap((m) => m.bankAccounts || [])
            .filter((b) => b?.isActive) || [];

        if (!alive) return;

        setBankAccounts(activeBanks);

        // default chọn bank đầu tiên nếu chưa chọn
        if (!selectedBankId && activeBanks[0]?._id) {
          setSelectedBankId(activeBanks[0]._id);
        }
      } catch (e) {
        console.error("Failed to load payment methods:", e);
        // không chặn checkout nếu lỗi, chỉ không có bank list
      } finally {
        if (alive) setLoadingBanks(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedBank: BankAccount | null = useMemo(() => {
    if (!selectedBankId) return bankAccounts[0] || null;
    return bankAccounts.find((b) => b._id === selectedBankId) || null;
  }, [bankAccounts, selectedBankId]);

  const qrUrl = useMemo(() => {
    return selectedBank?.qrImageUrl || fallbackQrUrl || "";
  }, [selectedBank?.qrImageUrl, fallbackQrUrl]);

  const transferContent = useMemo(() => {
    const name = fullName.trim() || "Ten Khach Hang";
    const phone = phoneNumber.trim() || "SDT";

    //chỉ đổi sang không dấu khi hiển thị nội dung chuyển khoản
    return removeVietnameseTones(`${name}  ${phone}`);
  }, [fullName, phoneNumber]);

  const canSubmit = useMemo(() => {
    if (state.items.length === 0) return false;
    if (
      !fullName.trim() ||
      !address.trim() ||
      !phoneNumber.trim() ||
      !email.trim()
    )
      return false;

    // ✅ Rule giữ nguyên: chuyển khoản bắt buộc có ảnh chứng từ
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

    // reset confirmation + proof khi đổi method
    setBankConfirmed(false);
    setProofUrl("");
    setProofName("");
  };

  const onChangeBank = (bankId: string) => {
    setSelectedBankId(bankId);

    // đổi ngân hàng => reset xác nhận + chứng từ để tránh nhầm
    setBankConfirmed(false);
    setProofUrl("");
    setProofName("");
    setErrMsg(null);
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
        price:
          typeof it.discount === "number" && it.discount > 0
            ? Math.round(it.price * (1 - it.discount / 100))
            : it.price,
      })),
      payment: {
        method,
        imageCheckPayment: method === "bank_transfer" ? proofUrl : undefined,
      },

      shippingCarrier: DEFAULT_SHIPPING_CARRIER,
      shippingCarrierCode: DEFAULT_SHIPPING_CARRIER,
    };

    try {
      const res = await ordersApi.create(payload);
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
            className="text-sm underline text-neutral-700 hover:text-black">
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
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs text-neutral-600">SĐT</span>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black"
                  />
                </label>

                <label className="grid gap-2 md:col-span-2">
                  <span className="text-xs text-neutral-600">Địa chỉ</span>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black"
                  />
                </label>

                <label className="grid gap-2 md:col-span-2">
                  <span className="text-xs text-neutral-600">Email</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black"
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
                {/* COD */}
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
                    {method === "cod" ? (
                      <div className="mt-4">
                        <div className="rounded-xl overflow-hidden border border-black/10">
                          <div className="bg-neutral-50 px-4 py-4">
                            <div className="text-sm text-black/90 leading-relaxed">
                              Quý khách vui lòng chú ý điện thoại sau khi đặt
                              hàng, nhân viên sẽ liên hệ xác nhận đơn trong ngày
                              đặt hàng trước khi đóng gói và chuyển giao hàng
                              cho đơn vị vận chuyển.
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </label>

                {/* BANK TRANSFER */}
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
                      Chọn ngân hàng → Quét QR chuyển khoản → Xác nhận
                    </div>

                    {method === "bank_transfer" ? (
                      <div className="mt-4">
                        {/* === UI giống ảnh: thanh đỏ + khung xám === */}
                        <div className="rounded-xl overflow-hidden border border-black/10">
                          <div className="bg-neutral-50 px-4 py-4">
                            {/* ✅ dropdown chọn ngân hàng */}
                            <div className="mb-4">
                              <label className="grid gap-2">
                                <span className="text-xs text-neutral-600">
                                  Chọn ngân hàng chuyển khoản
                                </span>
                                <select
                                  value={selectedBank?._id || ""}
                                  onChange={(e) => onChangeBank(e.target.value)}
                                  className="h-11 px-3 rounded-lg border border-black/15 bg-white outline-none focus:border-black cursor-pointer">
                                  {loadingBanks ? (
                                    <option value="">
                                      Đang tải danh sách...
                                    </option>
                                  ) : bankAccounts.length === 0 ? (
                                    <option value="">
                                      Chưa có tài khoản ngân hàng (Settings)
                                    </option>
                                  ) : (
                                    bankAccounts.map((b) => (
                                      <option key={b._id} value={b._id}>
                                        {b.bankName} • {b.accountNumber}
                                      </option>
                                    ))
                                  )}
                                </select>
                              </label>
                            </div>

                            {/* Nội dung bank + QR */}
                            <div className="flex flex-col md:flex-row md:items-start gap-4">
                              <div className="flex-1 text-sm text-black/90 leading-relaxed">
                                <div className="font-medium">
                                  {selectedBank?.bankName || "Ngân hàng"}
                                </div>
                                <div className="mt-2">
                                  Tên Tài Khoản:{" "}
                                  <span className="font-medium">
                                    {selectedBank?.accountName || "—"}
                                  </span>
                                </div>
                                <div className="mt-1">
                                  Số Tài Khoản:{" "}
                                  <span className="font-medium">
                                    {selectedBank?.accountNumber || "—"}
                                  </span>
                                </div>

                                <div className="mt-5">
                                  Nội Dung Chuyển Khoản:{" "}
                                  <span className="font-medium">
                                    {transferContent}
                                  </span>
                                </div>
                              </div>

                              <div className="shrink-0">
                                {loadingQr ? (
                                  <div className="h-36 w-36 rounded-xl border border-black/10 bg-white flex items-center justify-center text-xs text-neutral-500">
                                    Đang tải QR...
                                  </div>
                                ) : qrUrl ? (
                                  <a
                                    href={qrUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Bấm để mở QR lớn"
                                    className="block">
                                    <img
                                      src={qrUrl}
                                      alt="QR chuyển khoản"
                                      className="h-36 w-36 rounded-xl object-cover border border-black/10 bg-white"
                                    />
                                  </a>
                                ) : (
                                  <div className="h-36 w-36 rounded-xl border border-black/10 bg-white flex items-center justify-center text-xs text-neutral-500 text-center px-2">
                                    Chưa có QR
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
                              <div className="mt-1 text-sm leading-relaxed text-amber-900">
                                Vui lòng lưu lại ảnh bill chuyển khoản thành
                                công. Đơn hàng không có ảnh bill sẽ không được
                                xác nhận và giao đơn.
                              </div>
                            </div>

                            <div className="my-5 border-t border-dashed border-black/30" />

                            <ul className="text-sm text-black/80 leading-relaxed space-y-3">
                              <li>
                                - Phí vận chuyển toàn quốc đồng giá{" "}
                                <b>{formatVND(SHIPPING_FEE)}</b>. Đối với khách
                                nội thành HN có nhu cầu giao Hoả tốc, phí giao
                                hàng được tính theo app tại thời điểm đặt xe.
                              </li>

                              <li>
                                - Thời gian giao hàng dự kiến: 3~5 ngày (tuỳ khu
                                vực).
                              </li>
                              <li>
                                - Khi nhận hàng, quý khách vui lòng kiểm tra
                                tình trạng gói hàng khi nhận được từ đơn vị vận
                                chuyển.
                              </li>
                              <li>
                                - Quay lại video khi nhận và mở hàng phòng
                                trường hợp xảy ra khiếu nại với đơn vị vận
                                chuyển.
                              </li>
                            </ul>

                            {/* ✅ confirm button xuống phía dưới (không cho undo) */}
                            <div className="mt-5 flex flex-wrap items-center gap-3">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (bankConfirmed) return; // double-safety
                                  setBankConfirmed(true);
                                  setErrMsg(null);
                                }}
                                className={[
                                  "h-11 px-4 rounded-lg text-sm font-semibold transition",
                                  bankConfirmed
                                    ? "bg-emerald-600 text-white cursor-not-allowed opacity-90"
                                    : "bg-black text-white hover:opacity-95",
                                ].join(" ")}
                                disabled={
                                  bankConfirmed || bankAccounts.length === 0
                                }
                                aria-disabled={
                                  bankConfirmed || bankAccounts.length === 0
                                }>
                                {bankConfirmed
                                  ? "Đã xác nhận chuyển khoản"
                                  : "Xác nhận chuyển khoản thành công"}
                              </button>

                              {bankConfirmed ? (
                                <span className="text-xs text-neutral-600">
                                  * Vui lòng tải ảnh chứng từ để hoàn tất đặt
                                  hàng.
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {/* ✅ Upload proof: chỉ hiện khi bankConfirmed === true */}
                        {bankConfirmed ? (
                          <div className="mt-4 rounded-xl border border-black/10 bg-white p-4">
                            <div className="text-sm font-semibold">
                              Tải ảnh chứng từ chuyển khoản
                            </div>

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

                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <label
                                htmlFor="payment-proof"
                                className={[
                                  "inline-flex items-center justify-center",
                                  "h-10 px-4 rounded-lg border text-sm font-semibold",
                                  "transition cursor-pointer select-none",
                                  uploading
                                    ? "border-black/10 bg-black/5 text-black/40 cursor-not-allowed"
                                    : "border-black/20 hover:border-black/40 hover:bg-black/5",
                                ].join(" ")}>
                                {uploading
                                  ? "Đang upload..."
                                  : "Chọn ảnh chứng từ"}
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

                            {proofUrl ? (
                              <div className="mt-3 flex items-center gap-3">
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
                                    className="mt-1 text-xs underline text-neutral-600 hover:text-black">
                                    Xoá ảnh
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-3 text-xs text-neutral-500">
                                * Bạn cần tải ảnh chứng từ lên thì mới có thể
                                đặt hàng.
                              </div>
                            )}
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
                ].join(" ")}>
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
                    className="flex gap-3">
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
