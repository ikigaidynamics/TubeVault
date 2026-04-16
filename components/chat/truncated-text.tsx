"use client";

import { useState } from "react";

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export function TruncatedText({ text, maxLength = 200, className = "" }: TruncatedTextProps) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const needsTruncation = text.length > maxLength;
  const truncatedText = needsTruncation
    ? text.slice(0, text.lastIndexOf(" ", maxLength)) + ".."
    : text;

  const lines = (expanded ? text : truncatedText).split("\n");

  return (
    <div className={className}>
      {expanded ? (
        <div className="desc-scroll max-h-[140px] overflow-y-auto pr-2">
          {lines.map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </div>
      ) : (
        <div>
          {lines.map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </div>
      )}
      {needsTruncation && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-primary/60 transition-colors hover:text-primary"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
