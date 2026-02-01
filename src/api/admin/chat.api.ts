import { httpAdmin } from "../http";
import type { ChatRoom } from "../../types/chat";

export const getAdminRooms = (status?: string) =>
  httpAdmin.get<ChatRoom[]>("/admin/chat/rooms", {
    params: status ? { status } : undefined,
  });

export const closeRoom = (roomId: string) =>
  httpAdmin.patch<ChatRoom>(`/admin/chat/rooms/${roomId}/close`);
