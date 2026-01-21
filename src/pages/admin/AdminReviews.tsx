import { useEffect, useMemo, useState } from "react";
import {
  addReviewApi,
  deleteReviewApi,
  editReviewApi,
  getAdminReviewsApi,
} from "../../api/admin/review.api";
import type { ReviewItem, ReviewFormValues } from "../../types/review";
import ReviewFormModal from "../../components/admin/ReviewFormModal";

export default function AdminReviews() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKey, setSearchKey] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [submitting, setSubmitting] = useState(false);

  const [editing, setEditing] = useState<ReviewItem | null>(null);

  //  key để remount modal
  const [modalKey, setModalKey] = useState(0);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await getAdminReviewsApi();
      setItems(res.data.data ?? []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filtered = useMemo(() => {
    const q = searchKey.trim().toLowerCase();
    if (!q) return items;

    return items.filter((r) => {
      const fullName = (r.fullName ?? "").toLowerCase();
      const email = (r.email ?? "").toLowerCase();
      const content = (r.content ?? "").toLowerCase();
      return fullName.includes(q) || email.includes(q) || content.includes(q);
    });
  }, [items, searchKey]);

  const openCreate = () => {
    setModalMode("create");
    setEditing(null);
    setModalKey((k) => k + 1); //  remount
    setModalOpen(true);
  };

  const openEdit = (row: ReviewItem) => {
    setModalMode("edit");
    setEditing(row);
    setModalKey((k) => k + 1); //  remount
    setModalOpen(true);
  };

  const handleSubmit = async (values: ReviewFormValues) => {
    setSubmitting(true);
    try {
      if (modalMode === "create") {
        const res = await addReviewApi(values);
        alert(res.data.message || "Created");
      } else {
        if (!editing?._id) return alert("Thiếu reviewId");
        const res = await editReviewApi(editing._id, values);
        alert(res.data.message || "Updated");
      }

      setModalOpen(false);
      fetchReviews();
    } catch (e) {
      console.error(e);
      alert(modalMode === "create" ? "Create failed" : "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = confirm("Xóa testimonial này?");
    if (!ok) return;

    try {
      const res = await deleteReviewApi(id);
      alert(res.data.message || "Deleted");
      fetchReviews();
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Testimonials</h2>
          <p className="mt-1 text-sm text-gray-400">
            Nội dung hiển thị dạng “testimonial/feedback” (không nên trình bày
            như review xác thực).
          </p>
        </div>

        <button
          onClick={openCreate}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200"
        >
          Add Testimonial
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          className="w-80 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          placeholder="Search name/email/content..."
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Full name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Content</th>
              <th className="px-4 py-3 text-left">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Empty
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r._id}
                  className="border-t border-white/5 hover:bg-white/5"
                >
                  <td className="px-4 py-3 text-white">{r.fullName}</td>
                  <td className="px-4 py-3 text-white/80">{r.email}</td>
                  <td className="px-4 py-3 text-white">
                    <span className="line-clamp-2">{r.content}</span>
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(r)}
                      className="mr-3 text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ReviewFormModal
        key={modalKey}
        open={modalOpen}
        mode={modalMode}
        initialValues={editing ?? undefined}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}
