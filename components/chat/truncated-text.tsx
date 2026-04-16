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
  const displayText = !needsTruncation || expanded
    ? text
    : text.slice(0, text.lastIndexOf(" ", maxLength)) + "..";

  // Preserve newlines from the description
  const lines = displayText.split("\n");

  return (
    <div className={className}>
      {lines.map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {line}
        </span>
      ))}
      {needsTruncation && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-1 text-primary/60 transition-colors hover:text-primary"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
