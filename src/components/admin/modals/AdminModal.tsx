// //src/components/admin/modals/AdminModal.tsx
// import type { ReactNode } from "react";

// type Props = {
//   open: boolean;
//   title: string;
//   onClose: () => void;
//   children: ReactNode;
//   footer?: ReactNode;
//   widthClassName?: string; // ví dụ "max-w-2xl"
// };

// export default function AdminModal({
//   open,
//   title,
//   onClose,
//   children,
//   footer,
//   widthClassName = "max-w-2xl",
// }: Props) {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
//       <div
//         className={`w-full ${widthClassName} rounded-2xl border border-white/10 bg-[#0b0b0b] p-5 text-white shadow-2xl`}>
//         <div className="mb-4 flex items-center justify-between">
//           <h3 className="text-lg font-semibold">{title}</h3>
//           <button
//             onClick={onClose}
//             className="rounded-lg border border-white/15 px-3 py-1 text-sm hover:bg-white/10">
//             Close
//           </button>
//         </div>

//         <div>{children}</div>

//         {footer && <div className="mt-4 flex justify-end gap-3">{footer}</div>}
//       </div>
//     </div>
//   );
// }

import type { ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string; // ví dụ "max-w-2xl"
};

export default function AdminModal({
  open,
  title,
  onClose,
  children,
  footer,
  widthClassName = "max-w-2xl",
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className={[
          "w-full",
          widthClassName,
          "max-h-[90vh]",
          "rounded-2xl border border-white/10 bg-[#0b0b0b] text-white shadow-2xl",
          "flex flex-col overflow-hidden",
        ].join(" ")}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/15 px-3 py-1 text-sm hover:bg-white/10">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <div className="border-t border-white/10 px-5 py-4">
            <div className="flex justify-end gap-3">{footer}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
