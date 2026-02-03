// src/pages/client/cart/CartPage.tsx
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import type { CartItem } from "../../../types/cart";

function formatVND(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function itemKey(it: CartItem) {
  return `${it.productId}__${it.sizeId ?? "na"}__${it.color ?? "na"}`;
}

export default function CartPage() {
  const nav = useNavigate();
  const { state, totals, setQty, removeItem, discountedUnitPrice } = useCart();

  const goCheckout = () => {
    if (state.items.length === 0) return;
    nav("/checkout");
  };

  return (
    <div className="bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-wide">
            Giỏ hàng
          </h1>
          <div className="text-sm text-neutral-600">
            {totals.itemCount} sản phẩm
          </div>
        </div>

        {state.items.length === 0 ? (
          <div className="mt-8 border border-black/10 rounded-xl p-6">
            <div className="text-sm text-neutral-600">Giỏ hàng đang trống.</div>
            <Link
              to="/products"
              className="inline-block mt-4 text-sm underline"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* items */}
            <div className="lg:col-span-8">
              <div className="divide-y divide-black/10 border border-black/10 rounded-xl overflow-hidden">
                {state.items.map((it) => {
                  const unit = discountedUnitPrice(it.price, it.discount);
                  const hasDiscount =
                    typeof it.discount === "number" && it.discount > 0;

                  return (
                    <div key={itemKey(it)} className="p-4 md:p-5 flex gap-4">
                      <div className="h-24 w-24 rounded-lg overflow-hidden border border-black/10 bg-neutral-50 shrink-0">
                        <img
                          src={it.image}
                          alt={it.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold tracking-wide truncate">
                              {it.title}
                            </div>
                            <div className="mt-1 text-xs text-neutral-600 flex flex-wrap gap-x-4 gap-y-1">
                              {it.sizeLabel ? (
                                <span>Size: {it.sizeLabel}</span>
                              ) : null}
                              {it.color ? <span>Màu: {it.color}</span> : null}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                it.productId,
                                it.sizeId ?? null,
                                it.color ?? null,
                              )
                            }
                            className="text-xs text-neutral-500 hover:text-black underline"
                          >
                            Xoá
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4">
                          {/* qty */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="h-9 w-9 border border-black/15 rounded-lg hover:bg-black/5"
                              onClick={() =>
                                setQty(
                                  it.productId,
                                  Math.max(1, it.quantity - 1),
                                  it.sizeId ?? null,
                                  it.color ?? null,
                                )
                              }
                              aria-label="Giảm số lượng"
                            >
                              −
                            </button>
                            <div className="h-9 min-w-12 px-3 border border-black/15 rounded-lg flex items-center justify-center text-sm">
                              {it.quantity}
                            </div>
                            <button
                              type="button"
                              className="h-9 w-9 border border-black/15 rounded-lg hover:bg-black/5"
                              onClick={() =>
                                setQty(
                                  it.productId,
                                  it.quantity + 1,
                                  it.sizeId ?? null,
                                  it.color ?? null,
                                )
                              }
                              aria-label="Tăng số lượng"
                            >
                              +
                            </button>
                          </div>

                          {/* price */}
                          <div className="text-right">
                            <div className="text-sm font-semibold">
                              {formatVND(unit * it.quantity)}
                            </div>
                            {hasDiscount ? (
                              <div className="text-xs text-neutral-500 line-through">
                                {formatVND(it.price * it.quantity)}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Link
                  to="/products"
                  className="text-sm underline text-neutral-700 hover:text-black"
                >
                  ← Tiếp tục mua sắm
                </Link>
              </div>
            </div>

            {/* summary */}
            <div className="lg:col-span-4">
              <div className="border border-black/10 rounded-xl p-5">
                <div className="text-sm font-semibold tracking-wide">
                  Tổng đơn hàng
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

                  <div className="pt-3 border-t border-black/10 flex items-center justify-between">
                    <span className="font-semibold">Thành tiền</span>
                    <span className="font-semibold">
                      {formatVND(totals.total)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={goCheckout}
                  className="mt-5 w-full h-12 rounded-xl bg-black text-white text-sm font-semibold hover:opacity-95"
                >
                  Thanh toán
                </button>

                <div className="mt-3 text-xs text-neutral-500">
                  * Phí vận chuyển sẽ được tính ở bước thanh toán.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
