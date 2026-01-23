import { useState } from "react";
import { adminLoginApi } from "../../../api/admin/auth.api";
import { useAppDispatch } from "../../../app/hooks";
import { loginSuccess } from "../../../features/admin/auth/auth.slice";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await adminLoginApi({ username, password });
      dispatch(
        loginSuccess({
          user: res.data.data.user,
          token: res.data.data.token,
        }),
      );
      navigate("/admin/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert("Đăng nhập thất bại");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f]">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151515] p-8 shadow-2xl">
        {/* Logo / Brand */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-wide text-white">
            YoungDiamond
          </h1>
          <p className="mt-1 text-xs tracking-widest text-gray-400">
            ADMIN LOGIN
          </p>
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-400">Username</label>
          <input
            className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-4 py-2 text-sm text-white outline-none transition focus:border-white/30"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="mb-1 block text-sm text-gray-400">Password</label>
          <input
            type="password"
            className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-4 py-2 text-sm text-white outline-none transition focus:border-white/30"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Button */}
        <button
          onClick={handleLogin}
          className="w-full rounded-lg bg-white py-2.5 text-sm font-medium text-black transition hover:bg-gray-200"
        >
          Login
        </button>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          Authorized personnel only
        </p>
      </div>
    </div>
  );
}
