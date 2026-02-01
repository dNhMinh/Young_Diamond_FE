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
