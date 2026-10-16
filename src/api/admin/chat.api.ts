import type { ChatRoom } from "../../types/chat";
import baseApi from "../baseApi";

export const getAdminRooms = (status?: string) =>
  baseApi.get<ChatRoom[]>("/admin/chat/rooms", {
    params: status ? { status } : undefined,
  });

export const closeRoom = (roomId: string) =>
  baseApi.patch<ChatRoom>(`/admin/chat/rooms/${roomId}/close`);
