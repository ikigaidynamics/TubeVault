import Image from "next/image";

interface TypingIndicatorProps {
  label?: string;
}

export function TypingIndicator({ label }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3">
      <Image
        src="/TubeVault_Symbol.png"
        alt="TubeVault"
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 rounded-[10px] object-cover"
      />
      <div className="rounded-xl border border-[#1E1F21] bg-[#141416] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 animate-[typingPulse_1.2s_ease-in-out_infinite] rounded-full bg-gray-text/40" />
            <div className="h-1.5 w-1.5 animate-[typingPulse_1.2s_ease-in-out_infinite_0.15s] rounded-full bg-gray-text/40" />
            <div className="h-1.5 w-1.5 animate-[typingPulse_1.2s_ease-in-out_infinite_0.3s] rounded-full bg-gray-text/40" />
          </div>
          {label && (
            <span className="text-[11px] text-gray-text/40">{label}</span>
          )}
        </div>
      </div>
    </div>
  );
}
