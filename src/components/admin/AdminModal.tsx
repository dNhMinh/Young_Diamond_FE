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
        className={`w-full ${widthClassName} rounded-2xl border border-white/10 bg-[#0b0b0b] p-5 text-white shadow-2xl`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/15 px-3 py-1 text-sm hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div>{children}</div>

        {footer && <div className="mt-4 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
