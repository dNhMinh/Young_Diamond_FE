export type ChatRoomStatus = "open" | "pending" | "closed";

export interface ChatRoomContact {
  name?: string;
  phone?: string;
  email?: string;
}

export interface ChatRoom {
  _id: string;
  guestId: string;
  status: ChatRoomStatus;
  unreadByAdmin: number;
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
  contact?: ChatRoomContact;
}

export interface ChatMessage {
  _id: string;
  roomId: string;
  sender: "guest" | "admin";
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export const mergeChatMessages = (
  current: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] => {
  const byId = new Map(current.map((message) => [message._id, message]));
  incoming.forEach((message) => byId.set(message._id, message));

  return [...byId.values()].sort(
    (a, b) =>
      new Date(a.createdAt ?? 0).getTime() -
      new Date(b.createdAt ?? 0).getTime(),
  );
};
