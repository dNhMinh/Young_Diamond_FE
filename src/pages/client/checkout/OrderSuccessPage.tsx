// src/pages/client/checkout/OrderSuccessPage.tsx
import { Link, useSearchParams } from "react-router-dom";

export default function OrderSuccessPage() {
  const [sp] = useSearchParams();
  const code = sp.get("code");

  return (
    <div className="bg-white text-black">
      <div className="max-w-3xl mx-auto px-4 py-14">
        <div className="rounded-2xl border border-black/10 bg-white p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-black text-white grid place-items-center text-xl">
              ✓
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-wide">
                Đặt hàng thành công
              </h1>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                Cảm ơn bạn đã mua hàng tại YoungDiamond. Chúng tôi sẽ liên hệ để
                xác nhận đơn và tiến hành giao hàng sớm nhất.
              </p>
            </div>
          </div>

          {/* Code */}
          <div className="mt-6 rounded-xl border border-black/10 bg-neutral-50 p-4">
            <div className="text-xs text-neutral-600">Mã đơn hàng</div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-sm font-semibold tracking-wide">
                {code || "N/A"}
              </span>

              {code ? (
                <button
                  type="button"
                  onClick={() => void navigator.clipboard.writeText(code)}
                  className="text-xs underline text-neutral-600 hover:text-black"
                >
                  Sao chép mã
                </button>
              ) : null}
            </div>

            <div className="mt-3 text-xs text-neutral-500">
              Quý khách có thể lưu lại mã này để check tình trạng đơn với shop.
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/products"
              className="h-11 px-5 rounded-xl bg-black text-white text-sm font-semibold grid place-items-center hover:opacity-95"
            >
              Tiếp tục mua sắm
            </Link>

            <Link
              to="/"
              className="h-11 px-5 rounded-xl border border-black/15 text-sm font-semibold grid place-items-center hover:border-black/30"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
