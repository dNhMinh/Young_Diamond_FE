import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLogin from "../pages/admin/login/Login";
import Dashboard from "../pages/admin/dashboard/Dashboard";
import AdminProducts from "../pages/admin/products/Products";
import RequireAdmin from "../routes/RequireAdmin";
import RequireGuest from "../routes/RequireGuest";
import AdminLayout from "../layouts/AdminLayout";
import ProductDetailPage from "../pages/admin/products/ProductDetail";
import TrashProducts from "../pages/admin/products/TrashProducts";
import AdminProductCategories from "../pages/admin/productCategories/ProductCategories";
import TrashProductCategories from "../pages/admin/productCategories/TrashProductCategories";
import ProductCategoryDetail from "../pages/admin/productCategories/ProductCategoryDetail";
import AdminReviews from "../pages/admin/reviews/AdminReviews";
import AdminOrders from "../pages/admin/orders/AdminOrders";
import OrderDetailPage from "../pages/admin/orders/OrderDetailPage";
import AdminSettingsPage from "../pages/admin/settings/AdminSettingsPage";
import AdminBannersPage from "../pages/admin/banners/AdminBannersPage";

export const router = createBrowserRouter([
  {
    path: "/admin/login",
    element: (
      <RequireGuest>
        <AdminLogin />
      </RequireGuest>
    ),
  },
  {
    path: "/admin",
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      // Redirect /admin -> /admin/dashboard
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "products",
        element: <AdminProducts />,
      },
      {
        path: "products/:slug",
        element: <ProductDetailPage />,
      },
      {
        path: "products/trash",
        element: <TrashProducts />,
      },
      { path: "categories", element: <AdminProductCategories /> },
      { path: "categories/trash", element: <TrashProductCategories /> },
      { path: "categories/:slug", element: <ProductCategoryDetail /> },
      { path: "reviews", element: <AdminReviews /> },
      { path: "orders", element: <AdminOrders /> },
      { path: "orders/:orderId", element: <OrderDetailPage /> },
      { path: "settings", element: <AdminSettingsPage /> },
      { path: "banners", element: <AdminBannersPage /> },
    ],
  },
]);
