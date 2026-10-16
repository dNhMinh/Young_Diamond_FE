import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { useAppDispatch } from "./app/hooks";
import { useEffect } from "react";
import { initializeApp, logout } from "./features/admin/auth/auth.slice";
import { refreshAccessToken } from "./api/baseApi";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log("1. App effect chạy");
    refreshAccessToken()
      .catch((err) => {
        console.log("3. refresh lỗi:", err); // log lỗi trước khi logout
        dispatch(logout());
      })
      .finally(() => dispatch(initializeApp()));
  }, [dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
