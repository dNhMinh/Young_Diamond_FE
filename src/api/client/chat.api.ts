import { httpPublic } from "../http";
import type { ChatMessage, ChatRoom } from "../../types/chat";

export const getOrCreateRoom = () => httpPublic.get<ChatRoom>("/chat/room");

export const getMessages = (roomId: string) =>
  httpPublic.get<ChatMessage[]>(`/chat/messages/${roomId}`);
