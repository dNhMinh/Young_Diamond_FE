// src/pages/admin/orders/OrderDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrderDetailApi } from "../../../api/admin/order.api";
import { getAdminProductsApi } from "../../../api/admin/product.api";
import type { OrderDetail } from "../../../types/order";

type FetchStatus = "loading" | "success" | "error";

type ProductIndex = Record<
  string,
  {
    title: string;
    slug?: string;
  }
>;

export default function OrderDetailPage() {
  const { orderId } = useParams();

  // ✅ remount theo orderId => state reset về initial (loading) => KHÔNG cần setStatus("loading") trong effect
  return <OrderDetailPageInner key={orderId} orderId={orderId} />;
}

function OrderDetailPageInner({ orderId }: { orderId?: string }) {
  const [data, setData] = useState<OrderDetail | null>(null);
  const [status, setStatus] = useState<FetchStatus>("loading");

  const [productIndex, setProductIndex] = useState<ProductIndex>({});

  // 1) fetch order detail (GIỮ NHƯ CŨ)
  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    getOrderDetailApi(orderId)
      .then((res) => {
        if (cancelled) return;
        setData(res.data.data ?? null);
        setStatus("success");
      })
      .catch((e) => {
        if (cancelled) return;
        console.error(e);
        setData(null);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // 2) fetch products index (GIỮ NHƯ CŨ)
  useEffect(() => {
    if (status !== "success") return;
    if (!data?.products?.length) return;

    let cancelled = false;

    getAdminProductsApi()
      .then((res) => {
        if (cancelled) return;

        const map: ProductIndex = {};
        for (const p of res.data.data ?? []) {
          map[p._id] = { title: p.title, slug: p.slug };
        }
        setProductIndex(map);
      })
      .catch((e) => {
        console.error("Fetch products for index failed", e);
      });

    return () => {
      cancelled = true;
    };
  }, [status, data?._id]);

  const totalProducts = useMemo(() => {
    if (!data?.products?.length) return 0;
    return data.products.reduce((sum, p) => sum + p.quantity, 0);
  }, [data]);

  if (!orderId) return <div className="text-gray-300">Order not found</div>;
  if (status === "loading")
    return <div className="text-gray-300">Loading...</div>;
  if (status === "error" || !data)
    return <div className="text-gray-300">Order not found</div>;

  const proof = data.payment?.imageCheckPayment; // ✅ new
  const showFail = data.status === "failed"; // ✅ new

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Order Detail</h2>
          <p className="mt-1 text-sm text-gray-400">{data.orderCode}</p>

          {/* ✅ failReason */}
          {showFail ? (
            <p className="mt-2 text-sm text-red-300">
              <span className="text-red-200/80">Fail reason:</span>{" "}
              {data.failReason ?? "-"}
            </p>
          ) : null}
        </div>

        <Link
          to="/admin/orders"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
        >
          ← Back to Orders
        </Link>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5">
          <h3 className="mb-3 text-base font-semibold text-white">
            Shipping Info
          </h3>
          <div className="space-y-1 text-sm text-gray-300">
            <div>
              <span className="text-gray-400">Name:</span>{" "}
              {data.shippingInfo?.fullName ?? "-"}
            </div>
            <div>
              <span className="text-gray-400">Phone:</span>{" "}
              {data.shippingInfo?.phoneNumber ?? "-"}
            </div>
            <div>
              <span className="text-gray-400">Email:</span>{" "}
              {data.shippingInfo?.email ?? "-"}
            </div>
            <div>
              <span className="text-gray-400">Address:</span>{" "}
              {data.shippingInfo?.address ?? "-"}
            </div>
            <div>
              <span className="text-gray-400">Note:</span>{" "}
              {data.shippingInfo?.note ?? "-"}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5">
          <h3 className="mb-3 text-base font-semibold text-white">
            Order Summary
          </h3>
          <div className="space-y-1 text-sm text-gray-300">
            <div>
              <span className="text-gray-400">Status:</span> {data.status}
            </div>

            {/* Nếu BE có field này thì vẫn hiện, không có thì "-" */}
            <div>
              <span className="text-gray-400">Shipping carrier:</span>{" "}
              {data.shippingCarrier ?? "-"}
            </div>

            <div>
              <span className="text-gray-400">Payment method:</span>{" "}
              {data.payment?.method ?? "-"}
            </div>

            <div>
              <span className="text-gray-400">Payment status:</span>{" "}
              {data.payment?.paymentStatus ?? "-"}
            </div>

            <div>
              <span className="text-gray-400">Payment date:</span>{" "}
              {data.payment?.paymentDate
                ? new Date(data.payment.paymentDate).toLocaleString()
                : "-"}
            </div>

            {/* ✅ payment proof */}
            <div className="pt-2">
              <span className="text-gray-400">Payment proof:</span>{" "}
              {proof ? (
                <a
                  href={proof}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Open image
                </a>
              ) : (
                "-"
              )}
            </div>

            {proof ? (
              <div className="mt-2 overflow-hidden rounded-xl border border-white/10">
                <img
                  src={proof}
                  alt="Payment proof"
                  className="max-h-[280px] w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : null}

            {/* ✅ failReason trong summary */}
            {showFail ? (
              <div className="pt-2">
                <span className="text-gray-400">Fail reason:</span>{" "}
                {data.failReason ?? "-"}
              </div>
            ) : null}

            <div>
              <span className="text-gray-400">Items:</span> {totalProducts}
            </div>

            <div className="pt-2 text-white">
              <span className="text-gray-400">Total:</span>{" "}
              {data.totalAmount.toLocaleString()}₫
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {data.products?.length ? (
              data.products.map((p) => {
                const info = productIndex[p.productId];
                return (
                  <tr
                    key={p._id ?? `${p.productId}-${p.quantity}`}
                    className="border-t border-white/5 hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        {info?.slug ? (
                          <Link
                            to={`/admin/products/${info.slug}`}
                            className="text-white hover:underline"
                          >
                            {info.title}
                          </Link>
                        ) : (
                          <span className="text-white">
                            {info?.title ?? "Unknown product"}
                          </span>
                        )}

                        <span className="text-xs text-white/50">
                          {p.productId}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right text-white">
                      {p.price.toLocaleString()}₫
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      {p.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      {(p.price * p.quantity).toLocaleString()}₫
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  No products
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
