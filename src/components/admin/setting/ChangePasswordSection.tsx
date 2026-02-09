import { useMemo, useState } from "react";
import { changeAdminPasswordApi } from "../../../api/admin/auth.api";
import { getErrorMessage } from "./httpHelpers";

type Props = { active: boolean };

export default function ChangePasswordSection({ active }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => {
    return (
      currentPassword.trim().length > 0 &&
      newPassword.trim().length >= 6 &&
      newPassword === confirmPassword
    );
  }, [currentPassword, newPassword, confirmPassword]);

  const handleSubmit = async () => {
    if (!canSave) return;

    const ok = confirm("Đổi mật khẩu tài khoản admin?");
    if (!ok) return;

    setSaving(true);
    try {
      const res = await changeAdminPasswordApi({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      alert(res.data.message || "Đổi mật khẩu thành công");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: unknown) {
      console.error(e);
      alert(getErrorMessage(e, "Đổi mật khẩu thất bại."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={active ? "block" : "hidden"}>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-white/70">
          Cập nhật mật khẩu tài khoản admin hiện tại
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || !canSave}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Mật khẩu hiện tại"
          value={currentPassword}
          onChange={setCurrentPassword}
        />
        <div />
        <Field
          label="Mật khẩu mới"
          value={newPassword}
          onChange={setNewPassword}
        />
        <Field
          label="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChange={setConfirmPassword}
          helper={
            newPassword && confirmPassword && newPassword !== confirmPassword
              ? "Mật khẩu xác nhận không khớp"
              : undefined
          }
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  helper,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  helper?: string;
}) {
  return (
    <label className="space-y-2">
      <div className="text-sm text-white/80">{label}</div>
      <input
        type="password"
        className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {helper ? <div className="text-xs text-red-400">{helper}</div> : null}
    </label>
  );
}
