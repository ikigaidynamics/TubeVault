"use client";

import { useState } from "react";
import Image from "next/image";
import { SourceCard } from "./source-card";
import type { Source } from "@/lib/api";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  userAvatar?: string | null;
  channelId?: string;
}

export function ChatMessage({ role, content, sources, userAvatar, channelId }: ChatMessageProps) {
  const [avatarError, setAvatarError] = useState(false);

  return (
    <div
      className={`flex gap-3 ${role === "user" ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      {role === "user" ? (
        userAvatar && !avatarError ? (
          <Image
            src={userAvatar}
            alt="You"
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 rounded-[10px] object-cover ring-1 ring-white/[0.08]"
            unoptimized
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-white/[0.08] bg-dark-surface text-xs font-bold text-gray-text">
            U
          </div>
        )
      ) : (
        <Image
          src="/TubeVault_Symbol.png"
          alt="TubeVault"
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-[10px] object-cover ring-1 ring-primary/20"
        />
      )}

      {/* Content */}
      <div
        className={`max-w-[85%] space-y-2 ${role === "user" ? "items-end" : "items-start"}`}
      >
        <div
          className={`rounded-2xl px-4 py-3 text-[14px] leading-[1.65] ${
            role === "user"
              ? "bg-primary/10 font-medium text-cream border border-primary/20"
              : "border border-[#1E1F21] bg-[#111213] text-cream/90"
          }`}
        >
          {role === "assistant" ? (
            <div
              className="prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: content
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                  .replace(/\n/g, "<br />"),
              }}
            />
          ) : (
            content
          )}
        </div>

        {/* Sources */}
        {sources && sources.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-text/40">
              Sources
            </span>
            {sources.map((source, i) => (
              <SourceCard key={i} source={source} index={i} channelId={channelId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
