import { useCallback, useMemo, useState, useEffect } from "react";
import {
  getShippingCarriersApi,
  createShippingCarrierApi,
  updateShippingCarrierApi,
  deleteShippingCarrierApi,
} from "../../../api/admin/settings.api";
import type {
  ShippingCarrier,
  CreateShippingCarrierPayload,
  UpdateShippingCarrierPayload,
} from "../../../types/settings";
import ShippingCarrierFormModal from "../modals/ShippingCarrierFormModal";
import { getErrorMessage, isHttpErrorLike } from "./httpHelpers";

type Props = { active: boolean };

export default function ShippingCarriersSection({ active }: Props) {
  const [shipLoading, setShipLoading] = useState(false);
  const [shipSaving, setShipSaving] = useState(false);
  const [carriers, setCarriers] = useState<ShippingCarrier[]>([]);
  const [shipSearch, setShipSearch] = useState("");

  const [carrierModalOpen, setCarrierModalOpen] = useState(false);
  const [carrierModalMode, setCarrierModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingCarrier, setEditingCarrier] = useState<
    ShippingCarrier | undefined
  >(undefined);

  const filteredCarriers = useMemo(() => {
    const q = shipSearch.trim().toLowerCase();
    if (!q) return carriers;
    return carriers.filter((c) => {
      const s = `${c.code} ${c.name} ${c.description ?? ""}`.toLowerCase();
      return s.includes(q);
    });
  }, [carriers, shipSearch]);

  const fetchCarriers = useCallback(async () => {
    setShipLoading(true);
    try {
      const res = await getShippingCarriersApi();
      setCarriers(res.data.data ?? []);
    } catch (e: unknown) {
      if (isHttpErrorLike(e) && e.response?.status === 404) {
        setCarriers([]);
      } else {
        console.error(e);
        alert(
          getErrorMessage(e, "Không lấy được danh sách đơn vị vận chuyển."),
        );
      }
    } finally {
      setShipLoading(false);
    }
  }, []);

  useEffect(() => {
    if (active) void fetchCarriers();
  }, [active, fetchCarriers]);

  const openCreateCarrier = () => {
    setCarrierModalMode("create");
    setEditingCarrier(undefined);
    setCarrierModalOpen(true);
  };

  const openEditCarrier = (c: ShippingCarrier) => {
    setCarrierModalMode("edit");
    setEditingCarrier(c);
    setCarrierModalOpen(true);
  };

  const closeCarrierModal = () => {
    setCarrierModalOpen(false);
    setEditingCarrier(undefined);
    setCarrierModalMode("create");
  };

  const handleSubmitCarrierModal = async (
    data:
      | { mode: "create"; payload: CreateShippingCarrierPayload }
      | { mode: "edit"; id: string; payload: UpdateShippingCarrierPayload },
  ) => {
    setShipSaving(true);
    try {
      if (data.mode === "create") {
        const ok = confirm(
          `Tạo đơn vị vận chuyển "${data.payload.name}" (code: ${data.payload.code}) ?`,
        );
        if (!ok) return;

        const res = await createShippingCarrierApi(data.payload);
        alert(res.data.message || "Created");
      } else {
        const ok = confirm(
          `Cập nhật đơn vị vận chuyển "${data.payload.name ?? ""}" ?`,
        );
        if (!ok) return;

        const res = await updateShippingCarrierApi(data.id, data.payload);
        alert(res.data.message || "Updated");
      }

      closeCarrierModal();
      await fetchCarriers();
    } catch (e: unknown) {
      console.error(e);
      alert(getErrorMessage(e, "Thao tác thất bại."));
    } finally {
      setShipSaving(false);
    }
  };

  const handleDeleteCarrier = async (c: ShippingCarrier) => {
    const ok = confirm(`Xóa đơn vị vận chuyển "${c.name}" (code: ${c.code}) ?`);
    if (!ok) return;

    setShipSaving(true);
    try {
      const res = await deleteShippingCarrierApi(c._id);
      alert(res.data.message || "Deleted");

      if (
        carrierModalOpen &&
        carrierModalMode === "edit" &&
        editingCarrier?._id === c._id
      ) {
        closeCarrierModal();
      }

      await fetchCarriers();
    } catch (e: unknown) {
      console.error(e);
      alert(getErrorMessage(e, "Xóa thất bại."));
    } finally {
      setShipSaving(false);
    }
  };

  return (
    <div className={active ? "block" : "hidden"}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-white/70">
            Quản lý đơn vị vận chuyển (CRUD)
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              value={shipSearch}
              onChange={(e) => setShipSearch(e.target.value)}
              placeholder="Search code / name..."
              className="w-64 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            />

            <button
              onClick={fetchCarriers}
              disabled={shipLoading || shipSaving}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-60"
            >
              {shipLoading ? "Loading..." : "Refresh"}
            </button>

            <button
              onClick={openCreateCarrier}
              disabled={shipSaving}
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-60"
            >
              + Add carrier
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10">
          <div className="bg-white/5 px-4 py-3 text-sm text-white/80">
            Danh sách đơn vị vận chuyển ({filteredCarriers.length})
          </div>

          {shipLoading ? (
            <div className="px-4 py-10 text-center text-white/60">
              Loading...
            </div>
          ) : filteredCarriers.length === 0 ? (
            <div className="px-4 py-10 text-center text-white/60">Empty</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Active</th>
                  <th className="px-4 py-3 text-left">Logo</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCarriers.map((c) => (
                  <tr
                    key={c._id}
                    className="border-t border-white/5 hover:bg-white/5"
                  >
                    <td className="px-4 py-3 text-white">{c.code}</td>

                    <td className="px-4 py-3 text-white">
                      <div className="font-medium">{c.name}</div>
                      {c.description ? (
                        <div className="text-xs text-white/60 line-clamp-1">
                          {c.description}
                        </div>
                      ) : null}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={[
                          "inline-flex rounded-full border px-2 py-1 text-xs",
                          c.isActive
                            ? "border-green-500/30 bg-green-500/15 text-green-300"
                            : "border-white/10 bg-white/5 text-white/60",
                        ].join(" ")}
                      >
                        {c.isActive ? "active" : "inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {c.logoUrl ? (
                        <img
                          src={c.logoUrl}
                          alt={c.name}
                          className="h-7 w-20 rounded bg-black/30 object-contain"
                          onError={(e) => {
                            (
                              e.currentTarget as HTMLImageElement
                            ).style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-xs text-white/50">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditCarrier(c)}
                          disabled={shipSaving}
                          className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white hover:bg-white/10 disabled:opacity-60"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCarrier(c)}
                          disabled={shipSaving}
                          className="rounded-lg border border-red-500/40 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {carrierModalOpen ? (
          <ShippingCarrierFormModal
            key={`${carrierModalMode}-${editingCarrier?._id ?? "new"}`}
            open={carrierModalOpen}
            mode={carrierModalMode}
            initialValues={editingCarrier}
            onClose={closeCarrierModal}
            onSubmit={handleSubmitCarrierModal}
            submitting={shipSaving}
          />
        ) : null}
      </div>
    </div>
  );
}
