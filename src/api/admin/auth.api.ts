import baseApi from "../../api/baseApi";
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
} from "../../features/admin/auth/auth.types";

export const adminLoginApi = (data: LoginRequest) => {
  return baseApi.post<LoginResponse>("/admin/users/login", data);
};

export const changeAdminPasswordApi = (data: ChangePasswordRequest) => {
  return baseApi.patch<{ message: string }>(
    "/admin/users/change-password",
    data,
  );
};
