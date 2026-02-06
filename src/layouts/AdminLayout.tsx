import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import { logout } from "../features/admin/auth/auth.slice";
import {
  ChatNotificationProvider,
  useChatNotification,
} from "../hooks/useChatNotification";

function AdminLayoutContent() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { unreadCount } = useChatNotification();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-[#0f0f0f] text-gray-200">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/10 bg-[#0b0b0b]">
        <div className="px-6 py-5 text-xl font-semibold tracking-wide text-white">
          YoungDiamond
          <div className="mt-1 text-xs font-normal tracking-widest text-gray-400">
            ADMIN PANEL
          </div>
        </div>

        <nav className="mt-6 space-y-1 px-3">
          <MenuItem to="/admin/dashboard" label="Dashboard" />
          <MenuItem to="/admin/products" label="Products" />
          <MenuItem to="/admin/categories" label="Categories" />
          <MenuItem to="/admin/orders" label="Orders" />
          <MenuItem to="/admin/reviews" label="Reviews" />
          <MenuItem to="/admin/banners" label="Banners" />

          <MenuItem to="/admin/agent-requests" label="Agent Requests" />
          <MenuItem
            to="/admin/agent-requests/business-forms"
            label="Business Forms"
          />
          <div className="my-2 h-px bg-white/10" />
          <MenuItem to="/admin/settings" label="Settings" />
          <MenuItem to="/admin/chat" label="Chat" badge={unreadCount} />
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex flex-1 flex-col">
        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-white/10 bg-[#0f0f0f]/80 px-8 py-4 backdrop-blur">
          <h1 className="text-lg font-medium tracking-wide text-white">
            Admin
          </h1>

          <button
            onClick={handleLogout}
            className="rounded-md border border-red-500/40 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500 hover:text-white"
          >
            Logout
          </button>
        </header>

        {/* CONTENT */}
        <main className="flex-1 bg-[#121212] p-8">
          <div className="rounded-xl border border-white/10 bg-[#151515] p-6 shadow-lg">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function MenuItem({
  to,
  label,
  badge,
}: {
  to: string;
  label: string;
  badge?: number;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
        group flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition
        ${
          isActive
            ? "bg-white/10 text-white"
            : "text-gray-400 hover:bg-white/5 hover:text-white"
        }
      `
      }
    >
      <span className="tracking-wide">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </NavLink>
  );
}

export default function AdminLayout() {
  return (
    <ChatNotificationProvider>
      <AdminLayoutContent />
    </ChatNotificationProvider>
  );
}
