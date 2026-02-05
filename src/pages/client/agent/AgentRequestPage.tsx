// src/pages/client/agent-requests/AgentRequestPage.tsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  agentRequestsApi,
  type BusinessForm,
  type AgentRequestPayload,
} from "../../../api/client/agentRequests.api";

type FetchStatus = "loading" | "success" | "error";
type SubmitStatus = "idle" | "loading" | "success" | "error";

type ApiErrorResponse = { message?: string };

export default function AgentRequestPage() {
  // ====== business forms ======
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("loading");
  const [fetchErr, setFetchErr] = useState<string | null>(null);
  const [forms, setForms] = useState<BusinessForm[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");

  // ====== form fields ======
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [linkShop, setLinkShop] = useState("");
  const [description, setDescription] = useState("");

  // ====== submit ======
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [submitOkMsg, setSubmitOkMsg] = useState<string | null>(null);

  // fetch business forms
  useEffect(() => {
    let alive = true;

    (async () => {
      setFetchStatus("loading");
      setFetchErr(null);

      try {
        const res = await agentRequestsApi.getBusinessForms();
        const active = (res?.data || []).filter((x) => x?.isActive);

        if (!alive) return;

        setForms(active);
        setFetchStatus("success");

        // default select first
        if (!selectedFormId && active[0]?._id) {
          setSelectedFormId(active[0]._id);
        }
      } catch (e: unknown) {
        if (!alive) return;

        setFetchStatus("error");

        let msg = "Không tải được danh sách hình thức kinh doanh.";
        if (axios.isAxiosError<ApiErrorResponse>(e)) {
          msg = e.response?.data?.message || msg;
        } else if (e instanceof Error) {
          msg = e.message || msg;
        }
        setFetchErr(msg);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = useMemo(() => {
    if (submitStatus === "loading") return false;
    if (fetchStatus !== "success") return false;

    if (!fullName.trim()) return false;
    if (!phoneNumber.trim()) return false;
    if (!email.trim()) return false;
    if (!address.trim()) return false;
    if (!selectedFormId) return false;

    return true;
  }, [
    submitStatus,
    fetchStatus,
    fullName,
    phoneNumber,
    email,
    address,
    selectedFormId,
  ]);

  const onSubmit = async () => {
    if (!canSubmit) return;

    setSubmitStatus("loading");
    setSubmitErr(null);
    setSubmitOkMsg(null);

    const payload: AgentRequestPayload = {
      fullName: fullName.trim(),
      bussinessForm: selectedFormId, // ✅ đúng key theo file api của bạn
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      address: address.trim(),
      linkShop: linkShop.trim() || undefined,
      description: description.trim() || undefined,
    };

    try {
      const res = await agentRequestsApi.requestAgent(payload);

      setSubmitStatus("success");
      setSubmitOkMsg(res?.message || "Đăng ký làm đại lý thành công");

      // Nếu bạn muốn reset form sau submit thành công thì mở comment:
      // setFullName("");
      // setPhoneNumber("");
      // setEmail("");
      // setAddress("");
      // setLinkShop("");
      // setDescription("");
      // setSelectedFormId(forms[0]?._id || "");
    } catch (e: unknown) {
      setSubmitStatus("error");

      let msg = "Đăng ký thất bại. Vui lòng thử lại.";
      if (axios.isAxiosError<ApiErrorResponse>(e)) {
        msg = e.response?.data?.message || msg;
      } else if (e instanceof Error) {
        msg = e.message || msg;
      }
      setSubmitErr(msg);
    }
  };

  return (
    <div className="bg-white text-black">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-wide">
          Đăng ký làm đại lý kinh doanh
        </h1>

        <div className="mt-2 text-sm text-neutral-600">
          Vui lòng điền thông tin bên dưới. Chúng tôi sẽ liên hệ xác nhận sớm.
        </div>

        <div className="mt-8 border border-black/10 rounded-xl p-5">
          {/* Business form */}
          <div className="grid gap-2">
            <div className="text-sm font-semibold">Hình thức kinh doanh</div>

            {fetchStatus === "loading" ? (
              <div className="text-sm text-neutral-600">
                Đang tải danh sách...
              </div>
            ) : fetchStatus === "error" ? (
              <div className="text-sm text-red-600">{fetchErr}</div>
            ) : (
              <label className="grid gap-2">
                <span className="text-xs text-neutral-600">
                  Chọn hình thức kinh doanh
                </span>
                <select
                  value={selectedFormId}
                  onChange={(e) => setSelectedFormId(e.target.value)}
                  className="h-11 px-3 rounded-lg border border-black/15 bg-white outline-none focus:border-black cursor-pointer"
                >
                  {forms.length === 0 ? (
                    <option value="">Chưa có hình thức kinh doanh</option>
                  ) : (
                    forms.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name}
                      </option>
                    ))
                  )}
                </select>
              </label>
            )}
          </div>

          {/* Inputs */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="grid gap-2">
              <span className="text-xs text-neutral-600">Họ và tên</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs text-neutral-600">Số điện thoại</span>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
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
              <span className="text-xs text-neutral-600">Địa chỉ</span>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black"
              />
            </label>

            <label className="grid gap-2 md:col-span-2">
              <span className="text-xs text-neutral-600">
                Link shop / kênh bán (tuỳ chọn)
              </span>
              <input
                value={linkShop}
                onChange={(e) => setLinkShop(e.target.value)}
                className="h-11 px-3 rounded-lg border border-black/15 outline-none focus:border-black"
              />
            </label>

            <label className="grid gap-2 md:col-span-2">
              <span className="text-xs text-neutral-600">
                Mô tả / mong muốn hợp tác (tuỳ chọn)
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-28 p-3 rounded-lg border border-black/15 outline-none focus:border-black"
              />
            </label>
          </div>

          {/* submit messages */}
          {submitErr ? (
            <div className="mt-4 text-sm text-red-600">{submitErr}</div>
          ) : null}

          {submitOkMsg ? (
            <div className="mt-4 text-sm text-emerald-700">{submitOkMsg}</div>
          ) : null}

          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className={[
              "mt-5 w-full h-12 rounded-xl text-sm font-semibold transition",
              !canSubmit
                ? "bg-black/20 text-black/50 cursor-not-allowed"
                : "bg-black text-white hover:opacity-95",
            ].join(" ")}
          >
            {submitStatus === "loading" ? "Đang gửi đăng ký..." : "Gửi đăng ký"}
          </button>

          <div className="mt-3 text-xs text-neutral-500">
            * Bằng việc gửi đăng ký, bạn đồng ý để chúng tôi liên hệ xác nhận
            thông tin.
          </div>
        </div>
      </div>
    </div>
  );
}
