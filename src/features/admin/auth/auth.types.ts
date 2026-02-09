export interface AdminUser {
  _id: string;
  username: string;
  password: string;
  role: "admin";
  status: "active" | "inactive";
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: {
    user: AdminUser;
    token: string;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
