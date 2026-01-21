import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLogin from "../pages/admin/Login";
import Dashboard from "../pages/admin/Dashboard";
import AdminProducts from "../pages/admin/Products";
import RequireAdmin from "../routes/RequireAdmin";
import RequireGuest from "../routes/RequireGuest";
import AdminLayout from "../layouts/AdminLayout";
import ProductDetailPage from "../pages/admin/ProductDetail";
import TrashProducts from "../pages/admin/TrashProducts";
import AdminProductCategories from "../pages/admin/ProductCategories";
import TrashProductCategories from "../pages/admin/TrashProductCategories";
import ProductCategoryDetail from "../pages/admin/ProductCategoryDetail";
import AdminReviews from "../pages/admin/AdminReviews";

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

      // sau này thêm:
      // { path: "categories", element: <AdminCategories /> },
      // { path: "orders", element: <AdminOrders /> },
    ],
  },
]);
