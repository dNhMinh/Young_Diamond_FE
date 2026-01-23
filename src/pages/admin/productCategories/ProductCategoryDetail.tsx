// src/pages/admin/ProductCategoryDetail.tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getProductCategoryDetailApi,
  type ProductCategoryStatus,
} from "../../../api/admin/productCategory.api";

type Detail = {
  _id: string;
  title: string;
  description?: string;
  status: ProductCategoryStatus;
  deleted: boolean;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function ProductCategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Detail | null>(null);

  const fetchDetail = async () => {
    if (!slug) return;

    setLoading(true);
    try {
      const res = await getProductCategoryDetailApi(slug);
      setData(res.data.data as Detail);
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Category Detail</h2>

        <Link
          to="/admin/categories"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
        >
          ← Back to Categories
        </Link>
      </div>

      {loading ? (
        <div className="rounded-xl border border-white/10 p-6 text-gray-400">
          Loading...
        </div>
      ) : !data ? (
        <div className="rounded-xl border border-white/10 p-6 text-gray-400">
          Category not found
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-white">
                {data.title}
              </div>
              <div className="text-sm text-gray-400">{data.slug}</div>
            </div>

            <StatusBadge status={data.status} />
          </div>

          <div className="space-y-3 text-sm">
            <InfoRow label="ID" value={data._id} />
            <InfoRow label="Description" value={data.description || "-"} />
            <InfoRow label="Deleted" value={String(data.deleted)} />
            <InfoRow label="Created At" value={data.createdAt || "-"} />
            <InfoRow label="Updated At" value={data.updatedAt || "-"} />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
      <div className="w-28 text-gray-400">{label}</div>
      <div className="flex-1 text-white break-all">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: ProductCategoryStatus }) {
  const map: Record<ProductCategoryStatus, string> = {
    active: "bg-green-500/20 text-green-400",
    inactive: "bg-yellow-500/20 text-yellow-400",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs ${map[status]}`}>
      {status}
    </span>
  );
}
//comment test
//test
//test2
