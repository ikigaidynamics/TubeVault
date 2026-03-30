import Image from "next/image";

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <Image
        src="/TubeVault_Symbol.png"
        alt="TubeVault"
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 rounded-[10px] object-cover"
      />
      <div className="rounded-xl border border-white/[0.06] bg-[#1d1d1d] px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 animate-[typingPulse_1.2s_ease-in-out_infinite] rounded-full bg-gray-text/40" />
          <div className="h-1.5 w-1.5 animate-[typingPulse_1.2s_ease-in-out_infinite_0.15s] rounded-full bg-gray-text/40" />
          <div className="h-1.5 w-1.5 animate-[typingPulse_1.2s_ease-in-out_infinite_0.3s] rounded-full bg-gray-text/40" />
        </div>
      </div>
    </div>
  );
}
