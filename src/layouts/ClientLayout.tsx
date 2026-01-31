//src/layouts/ClientLayout.tsx
import { Outlet } from "react-router-dom";
import Header from "../components/client/common/Header";
import Footer from "../components/client/common/Footer";

export default function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
