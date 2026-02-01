import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Socket } from "socket.io-client";
import { createSocket } from "../../../utils/socket";
import { getMessages, getOrCreateRoom } from "../../../api/client/chat.api";
import type { ChatMessage, ChatRoom } from "../../../types/chat";

const formatTime = (iso?: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ChatPage() {
  const socketRef = useRef<Socket | null>(null);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const roomRes = await getOrCreateRoom();
        if (!isMounted) return;

        const roomData = roomRes.data;
        setRoom(roomData);

        const msgRes = await getMessages(roomData._id);
        if (!isMounted) return;

        setMessages(msgRes.data);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!room?._id) return;

    const socket = createSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_room", room._id);
    });

    socket.on("new_message", (message: ChatMessage) => {
      if (message.roomId !== room._id) return;
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("new_message");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [room?._id]);

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || !room?._id) return;

    socketRef.current?.emit("send_message", {
      roomId: room._id,
      content,
    });

    setInput("");
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-8">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Trò chuyện với quản trị
          </h2>
          {room?.status && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {room.status}
            </span>
          )}
        </div>

        <div className="mt-4 flex min-h-[360px] flex-col gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
          {loading && <div className="text-sm text-gray-500">Đang tải…</div>}

          {!loading && messages.length === 0 && (
            <div className="text-sm text-gray-500">
              Hãy gửi tin nhắn đầu tiên của bạn.
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                {
                  guest: "justify-end",
                  admin: "justify-start",
                }[message.sender]
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  {
                    guest: "bg-blue-600 text-white",
                    admin: "bg-white text-gray-900",
                  }[message.sender]
                }`}
              >
                <div>{message.content}</div>
                <div
                  className={`mt-1 text-[11px] opacity-70 ${
                    {
                      guest: "text-blue-100",
                      admin: "text-gray-500",
                    }[message.sender]
                  }`}
                >
                  {formatTime(message.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="mt-4 flex items-center gap-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Nhập tin nhắn…"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
}
