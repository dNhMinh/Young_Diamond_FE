import { useEffect, useMemo, useState } from "react";
import {
  getAdminSettingsApi,
  updateAdminSettingsApi,
  getShippingCarriersApi,
  createShippingCarrierApi,
  updateShippingCarrierApi,
  deleteShippingCarrierApi,
} from "../../api/admin/settings.api";
import type {
  SystemSettings,
  ShippingCarrier,
  CreateShippingCarrierPayload,
  UpdateShippingCarrierPayload,
} from "../../types/settings";
import ShippingCarrierFormModal from "../../components/admin/ShippingCarrierFormModal";

type TabKey = "system" | "shipping" | "paymentMethods" | "banking";

const tabs: { key: TabKey; label: string }[] = [
  { key: "system", label: "Cấu hình hệ thống" },
  { key: "shipping", label: "Đơn vị vận chuyển" },
  { key: "paymentMethods", label: "Phương thức thanh toán" },
  { key: "banking", label: "Tài khoản ngân hàng (Banking)" },
];

const emptyForm: Required<
  Pick<
    SystemSettings,
    | "siteTitle"
    | "siteDescription"
    | "siteLogoUrl"
    | "contactEmail"
    | "contactPhoneNumber"
    | "address"
    | "urlFacebook"
    | "urlInstagram"
    | "paymentQRImageUrl"
  >
> = {
  siteTitle: "",
  siteDescription: "",
  siteLogoUrl: "",
  contactEmail: "",
  contactPhoneNumber: "",
  address: "",
  urlFacebook: "",
  urlInstagram: "",
  paymentQRImageUrl: "",
};

// ====== NO any: helpers ======
type HttpErrorLike = {
  response?: {
    status?: number;
    data?: unknown;
  };
};

function isHttpErrorLike(e: unknown): e is HttpErrorLike {
  return typeof e === "object" && e !== null && "response" in e;
}

function hasMessage(x: unknown): x is { message?: unknown } {
  return typeof x === "object" && x !== null && "message" in x;
}

function getErrorMessage(e: unknown, fallback: string) {
  if (!isHttpErrorLike(e)) return fallback;
  const data = e.response?.data;
  if (hasMessage(data) && typeof data.message === "string") return data.message;
  return fallback;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("system");

  // ===== system settings =====
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [serverId, setServerId] = useState<string | undefined>(undefined);

  const canSave = useMemo(() => true, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await getAdminSettingsApi();
      const s = res.data.data;

      setServerId(s?._id);

      setForm({
        siteTitle: s?.siteTitle ?? "",
        siteDescription: s?.siteDescription ?? "",
        siteLogoUrl: s?.siteLogoUrl ?? "",
        contactEmail: s?.contactEmail ?? "",
        contactPhoneNumber: s?.contactPhoneNumber ?? "",
        address: s?.address ?? "",
        urlFacebook: s?.urlFacebook ?? "",
        urlInstagram: s?.urlInstagram ?? "",
        paymentQRImageUrl: s?.paymentQRImageUrl ?? "",
      });
    } catch (e: unknown) {
      console.error(e);
      alert(getErrorMessage(e, "Không lấy được cấu hình hệ thống."));
      setForm(emptyForm);
      setServerId(undefined);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const onChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!canSave) return;

    const ok = confirm("Lưu cấu hình hệ thống?");
    if (!ok) return;

    setSaving(true);
    try {
      const res = await updateAdminSettingsApi({ ...form });
      alert(res.data.message || "Saved");
      await fetchSettings();
    } catch (e: unknown) {
      console.error(e);
      alert(getErrorMessage(e, "Lưu cấu hình thất bại."));
    } finally {
      setSaving(false);
    }
  };

  // ===== shipping carriers =====
  const [shipLoading, setShipLoading] = useState(false);
  const [shipSaving, setShipSaving] = useState(false);
  const [carriers, setCarriers] = useState<ShippingCarrier[]>([]);
  const [shipSearch, setShipSearch] = useState("");

  // modal state
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

  const fetchCarriers = async () => {
    setShipLoading(true);
    try {
      const res = await getShippingCarriersApi();
      setCarriers(res.data.data ?? []);
    } catch (e: unknown) {
      // API có thể trả 404 khi không có dữ liệu
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
  };

  useEffect(() => {
    if (activeTab === "shipping") fetchCarriers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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

      // nếu đang mở modal edit đúng item này thì đóng
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
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Settings</h2>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = t.key === activeTab;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={[
                "rounded-full px-4 py-2 text-sm border",
                active
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white border-white/15 hover:bg-white/10",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        {/* ===== Shipping ===== */}
        {activeTab === "shipping" ? (
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

            {/* List */}
            <div className="overflow-hidden rounded-xl border border-white/10">
              <div className="bg-white/5 px-4 py-3 text-sm text-white/80">
                Danh sách đơn vị vận chuyển ({filteredCarriers.length})
              </div>

              {shipLoading ? (
                <div className="px-4 py-10 text-center text-white/60">
                  Loading...
                </div>
              ) : filteredCarriers.length === 0 ? (
                <div className="px-4 py-10 text-center text-white/60">
                  Empty
                </div>
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

            {/* Modal (unmount when closed) */}
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
        ) : null}

        {/* ===== System ===== */}
        {activeTab === "system" ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-white/70">
                ID:{" "}
                <span className="text-white">
                  {serverId ?? "(auto-create)"}
                </span>
              </div>

              <button
                onClick={handleSave}
                disabled={saving || loading || !canSave}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>

            {loading ? (
              <div className="py-10 text-center text-white/60">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Site title"
                  value={form.siteTitle}
                  onChange={(v) => onChange("siteTitle", v)}
                />
                <Field
                  label="Site description"
                  value={form.siteDescription}
                  onChange={(v) => onChange("siteDescription", v)}
                />
                <Field
                  label="Contact email"
                  value={form.contactEmail}
                  onChange={(v) => onChange("contactEmail", v)}
                />
                <Field
                  label="Contact phone"
                  value={form.contactPhoneNumber}
                  onChange={(v) => onChange("contactPhoneNumber", v)}
                />
                <Field
                  label="Address"
                  value={form.address}
                  onChange={(v) => onChange("address", v)}
                />
                <Field
                  label="Facebook URL"
                  value={form.urlFacebook}
                  onChange={(v) => onChange("urlFacebook", v)}
                />
                <Field
                  label="Instagram URL"
                  value={form.urlInstagram}
                  onChange={(v) => onChange("urlInstagram", v)}
                />

                <div className="md:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field
                    label="Logo URL"
                    value={form.siteLogoUrl}
                    onChange={(v) => onChange("siteLogoUrl", v)}
                  />
                  <Field
                    label="Payment QR Image URL"
                    value={form.paymentQRImageUrl}
                    onChange={(v) => onChange("paymentQRImageUrl", v)}
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <ImagePreview title="Logo preview" url={form.siteLogoUrl} />
                  <ImagePreview
                    title="Payment QR preview"
                    url={form.paymentQRImageUrl}
                  />
                </div>
              </div>
            )}
          </>
        ) : null}

        {/* ===== Other tabs placeholder ===== */}
        {activeTab !== "system" && activeTab !== "shipping" ? (
          <div className="text-sm text-white/70">
            Chưa có API phần này. Khi bạn gửi API (phương thức thanh toán / tài
            khoản ngân hàng), mình sẽ nối tiếp vào đúng tab này.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-xs text-white/60">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
        placeholder={label}
      />
    </div>
  );
}

function ImagePreview({ title, url }: { title: string; url: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#0f0f0f] p-3">
      <div className="mb-2 text-xs text-white/60">{title}</div>
      {url ? (
        <img
          src={url}
          alt={title}
          className="max-h-40 w-full rounded-md object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="text-sm text-white/40">No URL</div>
      )}
    </div>
  );
}
