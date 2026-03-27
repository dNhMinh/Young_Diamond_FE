//src/hooks/useChatNotification.ts
import { createElement } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import type { ReactNode } from "react";
import type { Socket } from "socket.io-client";
import { createSocket } from "../utils/socket";
import { getAdminRooms } from "../api/admin/chat.api";
import type { ChatMessage } from "../types/chat";
const playNewMessageSound = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(1040, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08);
    oscillator.frequency.setValueAtTime(1040, audioCtx.currentTime + 0.16);

    gainNode.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.5,
      audioCtx.currentTime + 0.01,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      audioCtx.currentTime + 0.3,
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.32);

    oscillator.onended = () => {
      void audioCtx.close().catch(() => {});
    };
  } catch {
    // ignore audio errors
  }
};
interface ChatNotificationContextType {
  unreadCount: number;
  orderUnreadCount: number;
  markRoomRead: (roomId: string) => void;
  setChatPageActive: (active: boolean) => void;
  setOrdersPageActive: (active: boolean) => void;
}

type AdminNewOrderPayload = {
  orderId?: string;
  orderCode?: string;
  createdAt?: string;
  totalAmount?: number;
  customerName?: string;
};

const ChatNotificationContext =
  createContext<ChatNotificationContextType | null>(null);

export function ChatNotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const socketRef = useRef<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [orderUnreadCount, setOrderUnreadCount] = useState(0);
  const isChatPageActiveRef = useRef(false);
  const isOrdersPageActiveRef = useRef(false);
  const unreadRoomsRef = useRef<Set<string>>(new Set());
  const unreadOrdersRef = useRef<Set<string>>(new Set());
  const hasSocketInitializedRef = useRef(false);

  const setChatPageActive = useCallback((active: boolean) => {
    isChatPageActiveRef.current = active;
  }, []);

  const setOrdersPageActive = useCallback((active: boolean) => {
    isOrdersPageActiveRef.current = active;

    if (active) {
      unreadOrdersRef.current.clear();
      setOrderUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadUnreadCount = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) return;

        const res = await getAdminRooms();
        if (!isMounted) return;

        const unreadRoomIds = new Set(
          res.data
            .filter((room) => (room.unreadByAdmin || 0) > 0)
            .map((room) => room._id),
        );
        unreadRoomsRef.current = unreadRoomIds;
        setUnreadCount(unreadRoomIds.size);
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

    // socket.on("admin_new_message", (message: ChatMessage) => {
    //   if (isChatPageActiveRef.current) return;
    //   if (!message?.roomId) return;
    //   if (unreadRoomsRef.current.has(message.roomId)) return;
    //   unreadRoomsRef.current.add(message.roomId);
    //   setUnreadCount((prev) => prev + 1);
    // });
    socket.on("admin_new_message", (message: ChatMessage) => {
      if (!message?.roomId) return;

      // Chỉ phát tiếng khi KHÔNG ở trang chat và là tin nhắn từ khách
      if (
        hasSocketInitializedRef.current &&
        !isChatPageActiveRef.current &&
        message.sender === "guest"
      ) {
        playNewMessageSound();
      }
      hasSocketInitializedRef.current = true;

      if (isChatPageActiveRef.current) return;
      if (unreadRoomsRef.current.has(message.roomId)) return;

      unreadRoomsRef.current.add(message.roomId);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("admin_new_order", (payload: AdminNewOrderPayload) => {
      const orderId = payload?.orderId;
      if (!orderId) return;

      if (hasSocketInitializedRef.current && !isOrdersPageActiveRef.current) {
        playNewMessageSound();
      }

      if (isOrdersPageActiveRef.current) return;
      if (unreadOrdersRef.current.has(orderId)) return;

      unreadOrdersRef.current.add(orderId);
      setOrderUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("admin_new_message");
      socket.off("admin_new_order");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const markRoomRead = useCallback((roomId: string) => {
    if (!unreadRoomsRef.current.has(roomId)) return;
    unreadRoomsRef.current.delete(roomId);
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  return createElement(
    ChatNotificationContext.Provider,
    {
      value: {
        unreadCount,
        orderUnreadCount,
        markRoomRead,
        setChatPageActive,
        setOrdersPageActive,
      },
    },
    children,
  );
}

export function useChatNotification() {
  const context = useContext(ChatNotificationContext);
  if (!context) {
    return {
      unreadCount: 0,
      orderUnreadCount: 0,
      markRoomRead: () => {},
      setChatPageActive: () => {},
      setOrdersPageActive: () => {},
    };
  }
  return context;
}
