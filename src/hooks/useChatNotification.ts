import { createElement } from "react";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";
import type { Socket } from "socket.io-client";
import { createSocket } from "../utils/socket";
import { getAdminRooms } from "../api/admin/chat.api";

interface ChatNotificationContextType {
  unreadCount: number;
  decreaseUnreadCount: (count: number) => void;
}

const ChatNotificationContext =
  createContext<ChatNotificationContextType | null>(null);

export function ChatNotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const socketRef = useRef<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadUnreadCount = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) return;

        const res = await getAdminRooms();
        if (!isMounted) return;

        const total = res.data.reduce(
          (sum, room) => sum + (room.unreadByAdmin || 0),
          0,
        );
        setUnreadCount(total);
      } catch {
        // Không có token hoặc lỗi API - bỏ qua
      }
    };

    loadUnreadCount();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    const socket = createSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("admin_join");
    });

    socket.on("admin_new_message", () => {
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("admin_new_message");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const decreaseUnreadCount = (count: number) => {
    setUnreadCount((prev) => Math.max(0, prev - count));
  };

  return createElement(
    ChatNotificationContext.Provider,
    { value: { unreadCount, decreaseUnreadCount } },
    children,
  );
}

export function useChatNotification() {
  const context = useContext(ChatNotificationContext);
  if (!context) {
    return { unreadCount: 0, decreaseUnreadCount: () => {} };
  }
  return context;
}
