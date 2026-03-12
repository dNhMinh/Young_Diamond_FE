// //src/components/client/chat/ChatWidget.tsx
// import { useEffect, useRef, useState, type FormEvent } from "react";
// import type { Socket } from "socket.io-client";
// import { createSocket } from "../../../utils/socket";
// import { getMessages, getOrCreateRoom } from "../../../api/client/chat.api";
// import type { ChatMessage, ChatRoom } from "../../../types/chat";

// const formatTime = (iso?: string) => {
//   if (!iso) return "";
//   return new Date(iso).toLocaleTimeString("vi-VN", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };

// export default function ChatWidget() {
//   const socketRef = useRef<Socket | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement | null>(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [room, setRoom] = useState<ChatRoom | null>(null);
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!isOpen) return;
//     let isMounted = true;

//     const init = async () => {
//       setLoading(true);
//       try {
//         const roomRes = await getOrCreateRoom();
//         if (!isMounted) return;

//         const roomData = roomRes.data;
//         setRoom(roomData);
//         localStorage.setItem("chatRoomId", roomData._id);

//         const msgRes = await getMessages(roomData._id);
//         if (!isMounted) return;

//         setMessages(msgRes.data);
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     init();

//     return () => {
//       isMounted = false;
//     };
//   }, [isOpen]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   useEffect(() => {
//     if (!room?._id || !isOpen) return;

//     const socket = createSocket();
//     socketRef.current = socket;

//     socket.on("connect", () => {
//       socket.emit("join_room", room._id);
//     });

//     socket.on("new_message", (message: ChatMessage) => {
//       if (message.roomId !== room._id) return;
//       setMessages((prev) => [...prev, message]);
//     });

//     return () => {
//       socket.off("new_message");
//       socket.disconnect();
//       socketRef.current = null;
//     };
//   }, [room?._id, isOpen]);

//   const handleSend = (event: FormEvent) => {
//     event.preventDefault();
//     const content = input.trim();
//     if (!content || !room?._id) return;

//     socketRef.current?.emit("send_message", {
//       roomId: room._id,
//       content,
//     });

//     setInput("");
//   };

//   return (
//     <div className="fixed bottom-6 right-6 z-50">
//       {isOpen && (
//         <div className="mb-3 w-[320px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
//           <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
//             <div>
//               <div className="text-sm font-semibold text-gray-900">
//                 Chat với quản trị
//               </div>
//               <div className="text-[11px] text-gray-500">Phản hồi nhanh</div>
//             </div>
//             <button
//               onClick={() => setIsOpen(false)}
//               className="text-lg text-gray-500 hover:text-gray-900"
//               aria-label="Đóng chat"
//             >
//               ✕
//             </button>
//           </div>

//           <div className="h-80 space-y-3 overflow-y-auto bg-gray-50 px-4 py-3">
//             {loading && <div className="text-xs text-gray-500">Đang tải…</div>}

//             {!loading && messages.length === 0 && (
//               <div className="text-xs text-gray-500">
//                 Hãy gửi tin nhắn đầu tiên của bạn.
//               </div>
//             )}

//             {messages.map((message) => (
//               <div
//                 key={message._id}
//                 className={`flex ${
//                   {
//                     guest: "justify-end",
//                     admin: "justify-start",
//                   }[message.sender]
//                 }`}
//               >
//                 <div
//                   className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs shadow-sm ${
//                     {
//                       guest: "bg-blue-600 text-white",
//                       admin: "bg-white text-gray-900",
//                     }[message.sender]
//                   }`}
//                 >
//                   <div>{message.content}</div>
//                   <div
//                     className={`mt-1 text-[10px] opacity-70 ${
//                       {
//                         guest: "text-blue-100",
//                         admin: "text-gray-500",
//                       }[message.sender]
//                     }`}
//                   >
//                     {formatTime(message.createdAt)}
//                   </div>
//                 </div>
//               </div>
//             ))}
//             <div ref={messagesEndRef} />
//           </div>

//           <form
//             onSubmit={handleSend}
//             className="flex items-center gap-2 border-t border-gray-100 px-3 py-3"
//           >
//             <input
//               value={input}
//               onChange={(event) => setInput(event.target.value)}
//               className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
//               placeholder="Nhập tin nhắn…"
//             />
//             <button
//               type="submit"
//               className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
//             >
//               Gửi
//             </button>
//           </form>
//         </div>
//       )}

//       {!isOpen && (
//         <button
//           onClick={() => setIsOpen(true)}
//           className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700"
//           aria-label="Mở chat"
//         >
//           💬
//         </button>
//       )}
//     </div>
//   );
// }





//src/components/client/chat/ChatWidget.tsx
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Socket } from "socket.io-client";
import { createSocket } from "../../../utils/socket";
import { getMessages, getOrCreateRoom } from "../../../api/client/chat.api";
import type { ChatMessage, ChatRoom } from "../../../types/chat";

// ✅ icon bạn muốn dùng
import chatIconImg from "../../../assets/chat-icon-YD.png";

const formatTime = (iso?: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ChatWidget() {
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const init = async () => {
      setLoading(true);
      try {
        const roomRes = await getOrCreateRoom();
        if (!isMounted) return;

        const roomData = roomRes.data;
        setRoom(roomData);
        localStorage.setItem("chatRoomId", roomData._id);

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
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!room?._id || !isOpen) return;

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
  }, [room?._id, isOpen]);

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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div
          className="
            mb-3 w-[320px] overflow-hidden rounded-2xl
            border border-black/15 bg-white shadow-2xl
          "
        >
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-black">
                Chat với quản trị
              </div>
              <div className="text-[11px] text-neutral-500">Phản hồi nhanh</div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="
                h-9 w-9 rounded-full grid place-items-center
                text-black/60 hover:text-black
                hover:bg-black/5 transition
                active:scale-[0.98]
              "
              aria-label="Đóng chat"
              title="Đóng"
              type="button"
            >
              ✕
            </button>
          </div>

          <div className="h-80 space-y-3 overflow-y-auto bg-white px-4 py-3">
            {loading && <div className="text-xs text-neutral-500">Đang tải…</div>}

            {!loading && messages.length === 0 && (
              <div className="text-xs text-neutral-500">
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
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs shadow-sm border ${
                    {
                      guest: "bg-black text-white border-black/15",
                      admin: "bg-white text-black border-black/10",
                    }[message.sender]
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div
                    className={`mt-1 text-[10px] opacity-70 ${
                      {
                        guest: "text-white/70",
                        admin: "text-neutral-500",
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

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-black/10 px-3 py-3"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="
                flex-1 rounded-xl border border-black/15
                px-3 py-2 text-xs text-black
                placeholder:text-neutral-400
                focus:border-black focus:outline-none
                focus:ring-2 focus:ring-black/10
              "
              placeholder="Nhập tin nhắn…"
            />
            <button
              type="submit"
              className="
                rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white
                hover:bg-black/90 transition active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              disabled={!input.trim()}
            >
              Gửi
            </button>
          </form>
        </div>
      )}

      <button
  onClick={() => setIsOpen((v) => !v)}
  className="
    flex h-24 w-24 items-center justify-center
    rounded-full
    bg-transparent
    border border-white/10
    shadow-none
    hover:bg-white/5 hover:border-white/20
    transition
    active:scale-[0.98]
    hover:bg-white/5 hover:border-white/30
    hover:scale-[1.02]
    active:scale-[0.98]
    overflow-hidden
    cursor-pointer
  "
  aria-label="Mở chat"
  title="Chat"
  type="button"
>
  <img
    src={chatIconImg}
    alt="Chat"
    className="h-18 w-18 object-contain transition
      group-hover:brightness-110
      group-hover:contrast-110
      group-hover:drop-shadow-[0_10px_24px_rgba(255,255,255,0.18)]"
    draggable={false}
  />
</button>
    </div>
  );
}