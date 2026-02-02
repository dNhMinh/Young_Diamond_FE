// src/components/client/cart/CartDrawer.tsx
import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../../context/CartContext";

type Props = {
  open: boolean;
  onClose: () => void;
};

function formatVND(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CartDrawer({ open, onClose }: Props) {
  const { state, totals, removeItem, setQty, discountedUnitPrice } = useCart();

  const cartCount = useMemo(() => state.items.length, [state.items.length]);

  // ESC để đóng + lock scroll khi mở
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div
      className={[
        "fixed inset-0 z-50",
        open ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!open}
    >
      {/* overlay */}
      <button
        type="button"
        onClick={onClose}
        className={[
          "absolute inset-0 bg-black/40 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
        aria-label="Close cart overlay"
      />

      {/* panel */}
      <aside
        className={[
          "absolute right-0 top-0 h-full w-full max-w-[420px] bg-white",
          "shadow-2xl border-l border-black/10",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
          "flex flex-col",
        ].join(" ")}
      >
        {/* header */}
        <div className="px-6 py-5 border-b border-black/10 flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold tracking-wide">Giỏ hàng</div>
            <div className="mt-1 text-sm text-neutral-700">
              Bạn đang có{" "}
              <span className="font-semibold text-black">{cartCount}</span> sản
              phẩm trong giỏ hàng
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-full hover:bg-black/5 grid place-items-center text-neutral-700"
            aria-label="Close cart"
            title="Đóng"
          >
            ×
          </button>
        </div>

        {/* list */}
        <div className="flex-1 overflow-auto px-6 py-5">
          {state.items.length === 0 ? (
            <div className="text-sm text-neutral-600">Giỏ hàng đang trống.</div>
          ) : (
            <div className="divide-y divide-black/10">
              {state.items.map((it) => {
                const key = `${it.productId}-${it.sizeId ?? "na"}-${it.color ?? "na"}`;
                const qty = Math.max(1, Math.floor(it.quantity || 1));
                const unit = discountedUnitPrice(it.price, it.discount);
                const lineTotal = unit * qty;

                const dec = () =>
                  setQty(
                    it.productId,
                    Math.max(1, qty - 1),
                    it.sizeId,
                    it.color,
                  );

                const inc = () =>
                  setQty(it.productId, qty + 1, it.sizeId, it.color);

                const remove = () =>
                  removeItem(it.productId, it.sizeId, it.color);

                return (
                  <div key={key} className="py-4 flex gap-4">
                    <div className="h-16 w-16 rounded-lg overflow-hidden border border-black/10 bg-neutral-50 shrink-0">
                      <img
                        src={it.image}
                        alt={it.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold tracking-wide truncate">
                            {it.title}
                          </div>

                          <div className="mt-1 text-xs text-neutral-600">
                            {it.sizeLabel ? (
                              <span className="font-semibold text-black">
                                {it.sizeLabel}
                              </span>
                            ) : null}
                            {it.color ? (
                              <span className="ml-2 uppercase">{it.color}</span>
                            ) : null}
                          </div>
                        </div>

                        {/* remove */}
                        <button
                          type="button"
                          onClick={remove}
                          className="h-9 w-9 rounded-lg hover:bg-black/5 grid place-items-center text-red-600"
                          aria-label="Remove item"
                          title="Xoá"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9 3h6m-9 4h12m-10 0 1 14h6l1-14"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        {/* qty control */}
                        <div className="inline-flex items-center rounded-lg border border-black/10 overflow-hidden">
                          <button
                            type="button"
                            onClick={dec}
                            className="h-9 w-10 grid place-items-center hover:bg-black/5"
                            aria-label="Decrease quantity"
                            title="Giảm"
                          >
                            –
                          </button>
                          <div className="h-9 w-10 grid place-items-center text-sm font-semibold">
                            {qty}
                          </div>
                          <button
                            type="button"
                            onClick={inc}
                            className="h-9 w-10 grid place-items-center hover:bg-black/5"
                            aria-label="Increase quantity"
                            title="Tăng"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-sm font-semibold">
                          {formatVND(lineTotal)}
                        </div>
                      </div>

                      {/* unit price hint */}
                      {typeof it.discount === "number" && it.discount > 0 ? (
                        <div className="mt-1 text-xs text-neutral-500">
                          Đơn giá: {formatVND(unit)}{" "}
                          <span className="line-through ml-1">
                            {formatVND(it.price)}
                          </span>{" "}
                          <span className="ml-1">(-{it.discount}%)</span>
                        </div>
                      ) : (
                        <div className="mt-1 text-xs text-neutral-500">
                          Đơn giá: {formatVND(unit)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="border-t border-black/10 px-6 py-5 bg-white">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-neutral-700">Tạm tính:</span>
              <span className="font-semibold text-red-600">
                {formatVND(totals.subtotal)}
              </span>
            </div>

            {totals.discountAmount > 0 ? (
              <div className="flex items-center justify-between">
                <span className="text-neutral-700">Giảm giá:</span>
                <span className="font-semibold text-red-600">
                  -{formatVND(totals.discountAmount)}
                </span>
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-2 border-t border-black/10">
              <span className="text-neutral-700">Tổng tiền:</span>
              <span className="font-semibold text-red-600">
                {formatVND(totals.total)}
              </span>
            </div>
          </div>

          <Link
            to="/checkout"
            onClick={onClose}
            className="mt-5 w-full h-12 rounded-xl bg-black text-white text-sm font-semibold grid place-items-center hover:opacity-95"
          >
            Thanh toán
          </Link>

          <div className="mt-4 text-center">
            <Link
              to="/cart"
              onClick={onClose}
              className="text-sm underline text-neutral-700 hover:text-black"
            >
              Chi tiết giỏ hàng
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
