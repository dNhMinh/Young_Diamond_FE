type Props = {
  page: number;
  limit: number;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export default function PaginationLite({
  page,
  limit,
  hasNext,
  onPrev,
  onNext,
}: Props) {
  const hasPrev = page > 1;

  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      <button
        disabled={!hasPrev}
        onClick={onPrev}
        className={`px-4 py-2 rounded-md border text-sm ${
          hasPrev
            ? "border-neutral-300 hover:bg-neutral-100"
            : "border-neutral-200 text-neutral-400 cursor-not-allowed"
        }`}
      >
        ← Prev
      </button>

      <div className="text-sm text-neutral-600">
        Page <span className="text-black font-medium">{page}</span> · Limit{" "}
        <span className="text-black font-medium">{limit}</span>
      </div>

      <button
        disabled={!hasNext}
        onClick={onNext}
        className={`px-4 py-2 rounded-md text-sm ${
          hasNext
            ? "bg-black text-white hover:opacity-90"
            : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
        }`}
      >
        Next →
      </button>
    </div>
  );
}
