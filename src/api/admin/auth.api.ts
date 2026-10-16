import baseApi from "../../api/baseApi";
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
} from "../../features/admin/auth/auth.types";

export const adminLoginApi = async (data: LoginRequest) => {
  console.log("Sending login request with data:", data);
  try {
    const response = await baseApi.post<LoginResponse>(
      "/admin/users/login",
      data,
    );
    console.log("Login response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const changeAdminPasswordApi = (data: ChangePasswordRequest) => {
  return baseApi.patch<{ message: string }>(
    "/admin/users/change-password",
    data,
  );
};

export const adminLogoutApi = () => {
  console.log("Sending logout request");
  return baseApi.post<{ message: string }>("/admin/auth/logout");
};
