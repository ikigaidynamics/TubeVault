import Image from "next/image";

interface TypingIndicatorProps {
  label?: string;
  progress?: {
    phase: string;
    completed: number;
    total: number;
    channels: {
      name: string;
      display_name: string;
      relevant: boolean;
      timeout?: boolean;
    }[];
  } | null;
}

export function TypingIndicator({ label, progress }: TypingIndicatorProps) {
  const statusText = progress
    ? progress.phase === "synthesizing"
      ? "Synthesizing answers..."
      : `Searching ${progress.total} channels... (${progress.completed}/${progress.total})`
    : label;

  return (
    <div className="flex gap-3">
      <Image
        src="/TubeVault_Symbol.png"
        alt="TubeVault"
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 rounded-[10px] object-cover"
      />
      <div className="rounded-xl border border-[#1E1F21] bg-[#141416] px-4 py-3 max-w-md">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 animate-[typingPulse_1.2s_ease-in-out_infinite] rounded-full bg-gray-text/40" />
              <div className="h-1.5 w-1.5 animate-[typingPulse_1.2s_ease-in-out_infinite_0.15s] rounded-full bg-gray-text/40" />
              <div className="h-1.5 w-1.5 animate-[typingPulse_1.2s_ease-in-out_infinite_0.3s] rounded-full bg-gray-text/40" />
            </div>
            {statusText && (
              <span className="text-[11px] text-gray-text/40">{statusText}</span>
            )}
          </div>
          {progress && progress.phase === "querying" && progress.channels.length > 0 && (
            <>
              {/* Progress bar */}
              <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/40 transition-all duration-500 ease-out"
                  style={{
                    width: `${(progress.completed / progress.total) * 100}%`,
                  }}
                />
              </div>
              {/* Completed channels */}
              <div className="flex flex-wrap gap-1">
                {progress.channels.map((ch) => (
                  <span
                    key={ch.name}
                    className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                      ch.timeout
                        ? "bg-yellow-500/10 text-yellow-400/50"
                        : ch.relevant
                          ? "bg-primary/10 text-primary/60"
                          : "bg-white/[0.04] text-gray-text/25"
                    }`}
                  >
                    {ch.relevant ? "\u2713" : ch.timeout ? "\u23F1" : "\u2014"}{" "}
                    {ch.display_name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
