// src/components/client/common/SectionTitle.tsx
import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
};

export default function SectionTitle({ title, subtitle, rightSlot }: Props) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h2
          className="
            text-[18px] md:text-[22px]
            font-medium
            tracking-[0.28em]
            uppercase
            text-neutral-900
            leading-tight
          "
        >
          {title}
        </h2>

        {subtitle ? (
          <p
            className="
              mt-2
              text-[12px] md:text-[13px]
              tracking-[0.08em]
              text-neutral-500
              leading-relaxed
            "
          >
            {subtitle}
          </p>
        ) : null}
      </div>

      {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
    </div>
  );
}
