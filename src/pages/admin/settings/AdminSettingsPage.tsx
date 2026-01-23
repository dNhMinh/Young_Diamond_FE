import { useState } from "react";

import SystemSettingsSection from "../../../components/admin/setting/SystemSettingsSection";
import ShippingCarriersSection from "../../../components/admin/setting/ShippingCarriersSection";
import PaymentMethodsSection from "../../../components/admin/setting/PaymentMethodsSection";
import BankingAccountsSection from "../../../components/admin/setting/BankingAccountsSection";

type TabKey = "system" | "shipping" | "paymentMethods" | "banking";

const tabs: { key: TabKey; label: string }[] = [
  { key: "system", label: "Cấu hình hệ thống" },
  { key: "shipping", label: "Đơn vị vận chuyển" },
  { key: "paymentMethods", label: "Phương thức thanh toán" },
  { key: "banking", label: "Tài khoản ngân hàng (BANKING)" },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("system");

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
        <SystemSettingsSection active={activeTab === "system"} />
        <ShippingCarriersSection active={activeTab === "shipping"} />
        <PaymentMethodsSection active={activeTab === "paymentMethods"} />
        <BankingAccountsSection active={activeTab === "banking"} />
      </div>
    </div>
  );
}
