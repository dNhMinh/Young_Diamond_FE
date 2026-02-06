import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { Socket } from "socket.io-client";
import { createSocket } from "../../../utils/socket";
import { getAdminRooms, closeRoom } from "../../../api/admin/chat.api";
import { getMessages } from "../../../api/client/chat.api";
import type { ChatMessage, ChatRoom } from "../../../types/chat";
import { useChatNotification } from "../../../hooks/useChatNotification";

const formatTime = (iso?: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (iso?: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN");
};

export default function AdminChatPage() {
  const socketRef = useRef<Socket | null>(null);
  const selectedRoomIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const previousMessagesLengthRef = useRef(0);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const { markRoomRead, setChatPageActive } = useChatNotification();

  const selectedRoom = useMemo(
    () => rooms.find((room) => room._id === selectedRoomId) ?? null,
    [rooms, selectedRoomId],
  );

  useEffect(() => {
    selectedRoomIdRef.current = selectedRoomId;
    previousMessagesLengthRef.current = 0;
  }, [selectedRoomId]);

  useEffect(() => {
    setChatPageActive(true);
    return () => setChatPageActive(false);
  }, [setChatPageActive]);

  useEffect(() => {
    if (messages.length === 0) return;

    const container = messagesContainerRef.current;
    const isInitialLoad = previousMessagesLengthRef.current === 0;

    if (isInitialLoad) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      previousMessagesLengthRef.current = messages.length;
      return;
    }

    if (container) {
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        50;

      if (isAtBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }

    previousMessagesLengthRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    let isMounted = true;

    const loadRooms = async () => {
      try {
        const res = await getAdminRooms();
        if (!isMounted) return;
        setRooms(res.data);
        if (res.data.length > 0) {
          setSelectedRoomId((prev) => prev ?? res.data[0]._id);
        }
      } finally {
        if (isMounted) setLoadingRooms(false);
      }
    };

    loadRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("admin_join");
      if (selectedRoomIdRef.current) {
        socket.emit("join_room", selectedRoomIdRef.current);
      }
    });

    socket.on("admin_new_message", (message: ChatMessage) => {
      setRooms((prev) => {
        const idx = prev.findIndex((room) => room._id === message.roomId);
        if (idx === -1) return prev;

        const room = prev[idx];
        const isActiveRoom = message.roomId === selectedRoomIdRef.current;
        const nextRoom: ChatRoom = {
          ...room,
          unreadByAdmin: isActiveRoom ? 0 : (room.unreadByAdmin ?? 0) + 1,
          lastMessageAt: message.createdAt ?? new Date().toISOString(),
        };

        return [nextRoom, ...prev.filter((_, i) => i !== idx)];
      });
    });

    socket.on("new_message", (message: ChatMessage) => {
      if (
        !selectedRoomIdRef.current ||
        message.roomId !== selectedRoomIdRef.current
      ) {
        return;
      }
      setMessages((prev) => [...prev, message]);
      setRooms((prev) =>
        prev.map((room) =>
          room._id === selectedRoomIdRef.current
            ? {
                ...room,
                lastMessageAt: message.createdAt ?? room.lastMessageAt,
                unreadByAdmin: 0,
              }
            : room,
        ),
      );
    });

    return () => {
      socket.off("admin_new_message");
      socket.off("new_message");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!selectedRoomId) return;
    socketRef.current?.emit("join_room", selectedRoomId);

    let isMounted = true;

    const loadMessages = async () => {
      const currentRoom = rooms.find((room) => room._id === selectedRoomId);
      const previousUnread = currentRoom?.unreadByAdmin || 0;

      const res = await getMessages(selectedRoomId);
      if (!isMounted) return;
      setMessages(res.data);
      setRooms((prev) =>
        prev.map((room) =>
          room._id === selectedRoomId ? { ...room, unreadByAdmin: 0 } : room,
        ),
      );

      if (previousUnread > 0) {
        markRoomRead(selectedRoomId);
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [selectedRoomId, rooms, markRoomRead]);

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || !selectedRoomId) return;

    socketRef.current?.emit("admin_send_message", {
      roomId: selectedRoomId,
      content,
    });

    setInput("");
  };

  const handleCloseRoom = async () => {
    if (!selectedRoomId) return;
    const res = await closeRoom(selectedRoomId);
    setRooms((prev) =>
      prev.map((room) => (room._id === res.data._id ? res.data : room)),
    );
  };

  return (
    <div className="flex min-h-[640px] gap-6">
      <aside className="w-72 shrink-0 rounded-xl border border-white/10 bg-[#111111] p-4">
        <div className="mb-3 text-sm font-semibold text-gray-200">
          Phòng chat
        </div>

        {loadingRooms && (
          <div className="text-xs text-gray-400">Đang tải phòng…</div>
        )}

        {!loadingRooms && rooms.length === 0 && (
          <div className="text-xs text-gray-400">Chưa có phòng chat.</div>
        )}

        <div className="mt-2 space-y-2">
          {rooms.map((room) => (
            <button
              key={room._id}
              onClick={() => setSelectedRoomId(room._id)}
              className={`flex w-full flex-col gap-1 rounded-lg border px-3 py-2 text-left text-xs transition ${
                selectedRoomId === room._id
                  ? "border-blue-500/60 bg-blue-500/10"
                  : "border-white/5 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-2 text-sm text-gray-100">
                <span>Khách {room.guestId.slice(0, 6)}</span>
                {room.unreadByAdmin > 0 && (
                  <span className="ml-auto rounded-full bg-red-500/80 px-2 py-0.5 text-[10px] text-white">
                    {room.unreadByAdmin}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-gray-400">
                {room.lastMessageAt
                  ? `Cập nhật ${formatDate(room.lastMessageAt)}`
                  : "Chưa có tin nhắn"}
              </div>
              <div className="text-[11px] text-gray-500">{room.status}</div>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex flex-1 flex-col rounded-xl border border-white/10 bg-[#0f0f0f] p-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <div className="text-sm font-semibold text-white">
              {selectedRoom ? `Room ${selectedRoom.guestId}` : "Chọn phòng"}
            </div>
            <div className="text-xs text-gray-400">
              {selectedRoom?.status ?? ""}
            </div>
          </div>
          <button
            onClick={handleCloseRoom}
            disabled={!selectedRoomId}
            className="rounded-lg border border-red-400/40 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Đóng phòng
          </button>
        </div>

        <div className="mt-4 flex max-h-[480px] min-h-[420px] flex-col gap-3 overflow-y-auto rounded-lg border border-white/5 bg-[#111111] p-4">
          {!selectedRoomId && (
            <div className="text-xs text-gray-400">
              Chọn phòng để xem tin nhắn.
            </div>
          )}

          {selectedRoomId && messages.length === 0 && (
            <div className="text-xs text-gray-400">Chưa có tin nhắn.</div>
          )}

          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                {
                  guest: "justify-start",
                  admin: "justify-end",
                }[message.sender]
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  {
                    guest: "bg-white text-gray-900",
                    admin: "bg-blue-600 text-white",
                  }[message.sender]
                }`}
              >
                <div>{message.content}</div>
                <div
                  className={`mt-1 text-[11px] opacity-70 ${
                    {
                      guest: "text-gray-500",
                      admin: "text-blue-100",
                    }[message.sender]
                  }`}
                >
                  {formatTime(message.createdAt)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="mt-4 flex items-center gap-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={!selectedRoomId}
            placeholder="Nhập tin nhắn…"
            className="flex-1 rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!selectedRoomId}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Gửi
          </button>
        </form>
      </section>
    </div>
  );
}
